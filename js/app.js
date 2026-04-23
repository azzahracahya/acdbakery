/**
 * app.js — ACD Bakery Kiosk
 * ✅ Sudah terintegrasi dengan Google Sheets
 */

/* ══════════════════════════════════════════════════════════════
   ⚠️  GANTI URL INI dengan URL Apps Script kamu!
   ══════════════════════════════════════════════════════════════ */
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxGNji9F-p_NoVfe4F_U4ta8ZkY0v77EPcDOLzkBjalMxydtjdYVbKjFoJrCNsLW9.../exec";
/* ══════════════════════════════════════════════════════════════ */

/* ── Google Sheets: Kirim Data Order ───────────────────────── */
async function kirimKeSheet(orderData) {
  try {
    await fetch(SHEET_URL, {
      method:  "POST",
      mode:    "no-cors",   // wajib untuk Google Apps Script
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(orderData)
    });
    console.log("✅ Data order berhasil dikirim ke Google Sheets");
  } catch (err) {
    console.error("❌ Gagal kirim ke Google Sheets:", err);
  }
}

/* ── State ─────────────────────────────────────────────────── */
let cart         = [];
let currentModal = null;
let modalQty     = 1;
let selectedPay  = null;
let selectedEw   = null;
let selectedBank = null;
let pendingOrderNum = null;

/* ── PIN E-Wallet State ─────────────────────────────────────── */
let ewPin    = '';
let activeEw = 'GoPay';

/* ── Helpers ────────────────────────────────────────────────── */
function fmt(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

/* ── Rating Helper ──────────────────────────────────────────── */
function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  let stars = '';
  for (let i = 0; i < full;  i++) stars += '<span class="star full">★</span>';
  if (half)                        stars += '<span class="star half">★</span>';
  for (let i = 0; i < empty; i++) stars += '<span class="star empty">★</span>';
  return stars;
}

/* ── Stock Badge Helper ─────────────────────────────────────── */
function stockBadge(stock) {
  if (stock === 0)   return '<span class="stock-badge out">Habis</span>';
  if (stock <= 5)    return '<span class="stock-badge low">Sisa ' + stock + '</span>';
  return '<span class="stock-badge ok">Stok ' + stock + '</span>';
}

/* ── Get live stock ─────────────────────────────────────────── */
function getStock(id, cat) {
  const p = products[cat].find(x => x.id === id);
  return p ? p.stock : 0;
}

/* ── Build Product Grid ─────────────────────────────────────── */
function buildGrid(cat) {
  const grid = document.getElementById(cat + '-grid');
  grid.innerHTML = '';

  products[cat].forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    if (p.stock === 0) card.classList.add('out-of-stock');

    const imgWrap = document.createElement('div');
    imgWrap.className = 'product-img-wrap';

    if (p.img) {
      const imgEl = document.createElement('img');
      imgEl.alt       = p.name;
      imgEl.className = 'product-photo';
      imgEl.src       = p.img;

      const emojiSpan = document.createElement('span');
      emojiSpan.className     = 'product-emoji';
      emojiSpan.style.display = 'none';
      emojiSpan.textContent   = p.emoji;

      imgEl.onerror = function() {
        imgEl.style.display     = 'none';
        emojiSpan.style.display = 'block';
      };

      imgWrap.appendChild(imgEl);
      imgWrap.appendChild(emojiSpan);
    } else {
      const emojiSpan = document.createElement('span');
      emojiSpan.className   = 'product-emoji';
      emojiSpan.textContent = p.emoji;
      imgWrap.appendChild(emojiSpan);
    }

    const badge = document.createElement('span');
    badge.className   = 'product-badge ' + cat;
    badge.textContent = cat === 'large' ? 'LARGE' : 'SMALL';
    imgWrap.appendChild(badge);

    const stockEl = document.createElement('span');
    stockEl.className = 'product-stock-badge';
    stockEl.innerHTML = stockBadge(p.stock);
    imgWrap.appendChild(stockEl);

    const info = document.createElement('div');
    info.className = 'product-info';
    info.innerHTML = `
      <div class="product-name">${p.name}</div>
      <div class="product-flavor">${p.flavor}</div>
      <div class="product-rating">
        ${renderStars(p.rating)}
        <span class="rating-num">${p.rating.toFixed(1)}</span>
      </div>
      <div class="product-price-row">
        <div class="product-price">${fmt(p.price)}</div>
        <button class="add-btn ${p.stock === 0 ? 'disabled' : ''}"
          onclick="event.stopPropagation(); quickAdd('${p.id}','${cat}')"
          ${p.stock === 0 ? 'disabled' : ''}>+</button>
      </div>
    `;

    card.appendChild(imgWrap);
    card.appendChild(info);
    card.addEventListener('click', () => openModal(p, cat));
    grid.appendChild(card);
  });
}

/* ── Tab Switching ──────────────────────────────────────────── */
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('small-section').style.display = tab === 'small' ? '' : 'none';
  document.getElementById('large-section').style.display = tab === 'large' ? '' : 'none';
}

/* ── Product Detail Modal ───────────────────────────────────── */
function openModal(p, cat) {
  currentModal = { ...p, cat };
  modalQty = 1;

  const modalImgEl = document.getElementById('m-img');
  modalImgEl.innerHTML = '';

  if (p.img) {
    const imgEl = document.createElement('img');
    imgEl.className = 'modal-photo';
    imgEl.alt       = p.name;
    imgEl.onerror   = function() {
      modalImgEl.innerHTML = '';
      const span = document.createElement('span');
      span.style.fontSize = '72px';
      span.textContent    = p.emoji;
      modalImgEl.appendChild(span);
    };
    imgEl.src = p.img;
    modalImgEl.appendChild(imgEl);
  } else {
    modalImgEl.textContent = p.emoji;
  }

  document.getElementById('m-name').textContent  = p.name;
  document.getElementById('m-cat').textContent   = (cat === 'small' ? '🧁 Small' : '🎂 Large') + ' — ' + p.flavor;
  document.getElementById('m-desc').textContent  = p.desc;
  document.getElementById('m-price').textContent = fmt(p.price);

  document.getElementById('m-rating').innerHTML =
    renderStars(p.rating) + ' <span class="rating-num">' + p.rating.toFixed(1) + '</span>';
  document.getElementById('m-stock').innerHTML = stockBadge(p.stock);

  updateModalQty();
  document.getElementById('product-modal').classList.add('open');
}

function closeModal() {
  document.getElementById('product-modal').classList.remove('open');
}

function changeModalQty(delta) {
  modalQty = Math.max(1, modalQty + delta);
  updateModalQty();
}

function updateModalQty() {
  document.getElementById('m-qty').textContent   = modalQty;
  document.getElementById('m-total').textContent = '= ' + fmt(currentModal.price * modalQty);
}

function addFromModal() {
  addToCart(currentModal, modalQty);
  closeModal();
}

/* ── Cart Operations ────────────────────────────────────────── */
function quickAdd(id, cat) {
  const p = products[cat].find(x => x.id === id);
  if (p) addToCart({ ...p, cat }, 1);
}

function addToCart(p, qty) {
  const existing = cart.find(c => c.id === p.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...p, qty });
  }
  updateCartBadge();
  showToast('✅ ' + p.name + ' ditambahkan!');
}

function updateCartBadge() {
  const total = cart.reduce((a, c) => a + c.qty, 0);
  document.getElementById('cart-badge').textContent = total;
}

/* ── Cart Panel ─────────────────────────────────────────────── */
function openCart() {
  renderCart();
  document.getElementById('cart-panel').classList.add('open');
}

function closeCart() {
  document.getElementById('cart-panel').classList.remove('open');
}

function renderCart() {
  const list    = document.getElementById('cart-items-list');
  const summary = document.getElementById('cart-summary');

  if (cart.length === 0) {
    list.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Keranjang masih kosong</p>
        <p style="font-size:12px;margin-top:6px;color:#bbb">Yuk pilih bolu kukus favoritmu!</p>
      </div>`;
    summary.innerHTML = '';
    document.getElementById('checkout-btn').disabled = true;
    return;
  }

  document.getElementById('checkout-btn').disabled = false;

  list.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div class="cart-item-emoji">
        ${item.img
          ? `<img src="${item.img}" alt="${item.name}"
                  style="width:48px;height:48px;object-fit:cover;border-radius:10px;display:block;"
                  onerror="this.style.display='none';this.nextElementSibling.style.display='block'">
             <span style="display:none;font-size:32px">${item.emoji}</span>`
          : `<span style="font-size:32px">${item.emoji}</span>`
        }
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${fmt(item.price)} / pcs</div>
        <div style="margin-top:2px">${renderStars(item.rating)} <span class="rating-num">${item.rating.toFixed(1)}</span></div>
      </div>
      <div class="cart-item-qty">
        <button class="cq-btn" onclick="updateQty(${i}, -1)">−</button>
        <span class="cq-num">${item.qty}</span>
        <button class="cq-btn" onclick="updateQty(${i}, 1)">+</button>
      </div>
    </div>
  `).join('');

  const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
  const tax      = Math.round(subtotal * 0.1);
  const total    = subtotal + tax;

  summary.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
    <div class="summary-row"><span>Pajak (10%)</span><span>${fmt(tax)}</span></div>
    <div class="summary-row total"><span>Total</span><span>${fmt(total)}</span></div>
  `;
}

function updateQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  updateCartBadge();
  renderCart();
}

/* ── Checkout ───────────────────────────────────────────────── */
function goCheckout() {
  closeCart();
  renderCheckoutSummary();
  document.getElementById('checkout-screen').classList.add('open');
}

function closeCheckout() {
  document.getElementById('checkout-screen').classList.remove('open');
}

function selectPay(el, method) {
  document.querySelectorAll('.pay-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  selectedPay = method;

  document.getElementById('transfer-panel').style.display = 'none';
  document.getElementById('ewallet-panel').style.display  = 'none';

  if (method === 'transfer') {
    document.getElementById('transfer-panel').style.display = 'block';
    const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
    const total    = subtotal + Math.round(subtotal * 0.1);
    document.getElementById('ti-amount').textContent = fmt(total);
    selectedBank = null;
    document.querySelectorAll('.bank-btn').forEach(b => b.className = 'bank-btn');
    document.getElementById('transfer-info').style.display = 'none';

  } else if (method === 'ewallet') {
    document.getElementById('ewallet-panel').style.display = 'block';
    const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
    const total    = subtotal + Math.round(subtotal * 0.1);
    document.getElementById('ew-amount-display').textContent = fmt(total);
    selectedEw = activeEw;
  }
}

/* ── Transfer Bank ──────────────────────────────────────────── */
function selectBank(bankName, norek, atasNama) {
  selectedBank = bankName;

  document.querySelectorAll('.bank-btn').forEach(b => b.className = 'bank-btn');
  const map      = { BCA: 'bank-bca', Mandiri: 'bank-mandiri', BRI: 'bank-bri' };
  const classMap = { BCA: 'active-bca', Mandiri: 'active-mandiri', BRI: 'active-bri' };
  const btn = document.getElementById(map[bankName]);
  if (btn) btn.classList.add(classMap[bankName]);

  document.getElementById('ti-bank').textContent  = bankName;
  document.getElementById('ti-norek').textContent = norek;
  document.getElementById('ti-name').textContent  = atasNama;

  const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
  const total    = subtotal + Math.round(subtotal * 0.1);
  document.getElementById('ti-amount').textContent = fmt(total);
  document.getElementById('transfer-info').style.display = 'flex';

  initPinInputs();
  setTimeout(() => {
    const first = document.querySelector('.pin-box');
    if (first) first.focus();
  }, 100);
}

function copyNorek() {
  const norek = document.getElementById('ti-norek').textContent;
  navigator.clipboard.writeText(norek).then(() => {
    showToast('✅ Nomor rekening disalin!');
  }).catch(() => {
    showToast('📋 ' + norek);
  });
}

/* ── E-Wallet ───────────────────────────────────────────────── */
function selectEwalletNew(btn) {
  document.querySelectorAll('.ew-tab-new').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  const wallet = btn.dataset.wallet;
  const bg     = btn.dataset.bg;
  const num    = btn.dataset.num;
  const emoji  = btn.dataset.emoji;

  activeEw   = wallet;
  selectedEw = wallet;

  document.getElementById('ew-card-new').style.background  = bg;
  document.getElementById('ew-card-name').textContent      = wallet;
  document.getElementById('ew-card-emoji').textContent     = emoji;
  document.getElementById('ew-card-num').textContent       = num;
  document.getElementById('ew-number-display').textContent = num;

  const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
  const total    = subtotal + Math.round(subtotal * 0.1);
  document.getElementById('ew-amount-display').textContent = fmt(total);
}

function copyEwallet() {
  const num = document.getElementById('ew-number-display').textContent.replace(/-/g, '');
  navigator.clipboard.writeText(num).then(() => {
    showToast('✅ Nomor e-wallet disalin!');
  }).catch(() => {});
}

/* ── PIN E-Wallet ───────────────────────────────────────────── */
function openEwPin() {
  ewPin = '';
  updateEwDots();
  document.getElementById('pin-error-ew').textContent     = '';
  document.getElementById('pin-form-ew').style.display    = 'block';
  document.getElementById('pin-success-ew').style.display = 'none';
  document.getElementById('pin-wallet-ew').textContent    = activeEw;
  document.getElementById('pin-amount-ew').textContent    =
    document.getElementById('ew-amount-display').textContent;
  document.getElementById('pin-overlay-ew').classList.add('show');
}

function closeEwPin() {
  document.getElementById('pin-overlay-ew').classList.remove('show');
  ewPin = '';
  updateEwDots();
}

function ewPinPress(d) {
  if (ewPin.length >= 6) return;
  ewPin += d;
  updateEwDots();
  if (ewPin.length === 6) setTimeout(checkEwPin, 300);
}

function ewPinDel() {
  ewPin = ewPin.slice(0, -1);
  updateEwDots();
  document.getElementById('pin-error-ew').textContent = '';
}

function updateEwDots() {
  for (let i = 0; i < 6; i++) {
    const d = document.getElementById('pd' + i);
    if (!d) continue;
    ewPin.length > i ? d.classList.add('filled') : d.classList.remove('filled');
  }
}

function checkEwPin() {
  if (ewPin === '123456') {
    document.getElementById('pin-form-ew').style.display    = 'none';
    document.getElementById('pin-success-ew').style.display = 'flex';
    setTimeout(() => {
      closeEwPin();
      finishOrder();
    }, 1800);
  } else {
    document.getElementById('pin-error-ew').textContent = 'PIN salah. Coba lagi.';
    ewPin = '';
    updateEwDots();
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const overlay = document.getElementById('pin-overlay-ew');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) closeEwPin();
    });
  }
});

/* ── PIN Input (Transfer Bank) ──────────────────────────────── */
function initPinInputs() {
  const boxes = document.querySelectorAll('.pin-box');
  boxes.forEach((box, i) => {
    box.value = '';
    box.classList.remove('filled');

    box.addEventListener('keydown', function(e) {
      if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab') {
        e.preventDefault();
        return;
      }
      if (e.key === 'Backspace') {
        this.value = '';
        this.classList.remove('filled');
        if (i > 0) boxes[i - 1].focus();
      }
    });

    box.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '').slice(-1);
      if (this.value) {
        this.classList.add('filled');
        if (i < boxes.length - 1) boxes[i + 1].focus();
      } else {
        this.classList.remove('filled');
      }
    });

    box.addEventListener('paste', function(e) {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
      text.split('').slice(0, 6).forEach((ch, j) => {
        if (boxes[j]) { boxes[j].value = ch; boxes[j].classList.add('filled'); }
      });
      const next = Math.min(text.length, 5);
      boxes[next].focus();
    });
  });
}

function getPinValue() {
  return Array.from(document.querySelectorAll('.pin-box')).map(b => b.value).join('');
}

function clearPin() {
  document.querySelectorAll('.pin-box').forEach(b => { b.value = ''; b.classList.remove('filled'); });
}

/* ── Stock Validation ───────────────────────────────────────── */
function validateStock() {
  for (const item of cart) {
    const cat = item.cat;
    const p   = products[cat].find(x => x.id === item.id);
    if (!p) continue;
    if (item.qty > p.stock) {
      showToast(`⚠️ Stok ${item.name} hanya tersisa ${p.stock} pcs!`);
      return false;
    }
    if (p.stock === 0) {
      showToast(`⚠️ ${item.name} sudah habis!`);
      return false;
    }
  }
  return true;
}

function deductStock() {
  cart.forEach(item => {
    const cat = item.cat;
    const p   = products[cat].find(x => x.id === item.id);
    if (p) p.stock = Math.max(0, p.stock - item.qty);
  });
  buildGrid('small');
  buildGrid('large');
}

/* ── Confirm Order ──────────────────────────────────────────── */
function confirmOrder() {
  const name = document.getElementById('cust-name').value.trim();
  if (!name)        { showToast('⚠️ Masukkan nama pemesan dulu!'); return; }
  if (!selectedPay) { showToast('⚠️ Pilih metode pembayaran!');    return; }

  if (!validateStock()) return;

  if (selectedPay === 'transfer') {
    if (!selectedBank) { showToast('⚠️ Pilih bank tujuan transfer dulu!'); return; }
    const pin = getPinValue();
    if (pin.length < 6) {
      showToast('⚠️ Masukkan PIN bank 6 digit!');
      const boxes = document.querySelectorAll('.pin-box');
      for (const b of boxes) { if (!b.value) { b.focus(); break; } }
      return;
    }
  }

  if (selectedPay === 'ewallet') {
    if (!selectedEw) { showToast('⚠️ Pilih e-wallet dulu!'); return; }
    openEwPin();
    return;
  }

  if (selectedPay === 'qris') {
    openQris();
    return;
  }

  finishOrder();
}

/* ── QRIS ───────────────────────────────────────────────────── */
let qrisTimerInterval = null;

function openQris() {
  const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
  const total    = subtotal + Math.round(subtotal * 0.1);
  const name     = document.getElementById('cust-name').value.trim();

  pendingOrderNum = 'ACD-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  document.getElementById('qris-amount').textContent   = fmt(total);
  document.getElementById('qris-order-id').textContent = 'Order ID: ' + pendingOrderNum + ' · a/n ACD Bakery';

  const qrisPayload = [
    'ACD-BAKERY-QRIS',
    'merchant=ACD Bakery Malang',
    'order=' + pendingOrderNum,
    'nama=' + name,
    'total=' + total
  ].join('|');

  const wrap = document.getElementById('qris-canvas-wrap');
  wrap.innerHTML = '';

  try {
    new QRCode(wrap, {
      text:         qrisPayload,
      width:        190,
      height:       190,
      colorDark:    '#3B1F0A',
      colorLight:   '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch(e) {
    wrap.innerHTML = '<p style="color:#c00;font-size:12px;text-align:center">Gagal generate QR: ' + e + '</p>';
  }

  startQrisTimer(5 * 60);
  document.getElementById('checkout-screen').scrollTop = 0;
  document.getElementById('qris-modal').classList.add('open');
}

function closeQris() {
  clearInterval(qrisTimerInterval);
  document.getElementById('qris-modal').classList.remove('open');
}

function startQrisTimer(seconds) {
  clearInterval(qrisTimerInterval);
  let remaining = seconds;
  const timerEl = document.getElementById('qris-timer');

  function tick() {
    const m = String(Math.floor(remaining / 60)).padStart(2, '0');
    const s = String(remaining % 60).padStart(2, '0');
    timerEl.textContent = m + ':' + s;
    timerEl.classList.toggle('urgent', remaining <= 60);
    if (remaining <= 0) {
      clearInterval(qrisTimerInterval);
      timerEl.textContent = '00:00';
      showToast('⏰ QR Code kedaluwarsa. Silakan coba lagi.');
      closeQris();
    }
    remaining--;
  }

  tick();
  qrisTimerInterval = setInterval(tick, 1000);
}

function qrisConfirm() {
  clearInterval(qrisTimerInterval);
  closeQris();
  finishOrder();
}

/* ══════════════════════════════════════════════════════════════
   ── Finish Order (+ Kirim ke Google Sheets) ─────────────────
   ══════════════════════════════════════════════════════════════ */
function finishOrder() {
  const name     = document.getElementById('cust-name').value.trim();
  const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
  const total    = subtotal + Math.round(subtotal * 0.1);
  const orderNum = pendingOrderNum || ('ACD-' + Math.random().toString(36).substring(2, 8).toUpperCase());

  const payNames = {
    tunai:    'Tunai / Cash',
    transfer: 'Transfer Bank (' + (selectedBank || '') + ')',
    qris:     'QRIS',
    ewallet:  'E-Wallet (' + (selectedEw || activeEw) + ')',
  };

  /* ── ✅ KIRIM KE GOOGLE SHEETS ── */
  kirimKeSheet({
    nama:    name,
    noHp:    "-",
    produk:  cart.map(c => c.name + ' x' + c.qty).join(', '),
    ukuran:  cart.map(c => c.cat === 'small' ? 'Small' : 'Large').join(', '),
    qty:     cart.reduce((a, c) => a + c.qty, 0),
    total:   fmt(total),
    bayar:   payNames[selectedPay],
    orderID: orderNum
  });
  /* ── ✅ SELESAI KIRIM ── */

  document.getElementById('order-number').textContent = orderNum;
  document.getElementById('success-info').textContent =
    name + ' · ' + fmt(total) + ' · ' + payNames[selectedPay];

  const transferNote = document.getElementById('success-transfer-note');
  if (selectedPay === 'transfer' && selectedBank) {
    const norek = document.getElementById('ti-norek').textContent;
    transferNote.style.display = 'block';
    transferNote.innerHTML = `
      <div class="stn-title">📋 Instruksi Transfer</div>
      <div class="stn-row"><span>Bank</span><strong>${selectedBank}</strong></div>
      <div class="stn-row"><span>No. Rekening</span><strong>${norek}</strong></div>
      <div class="stn-row"><span>Jumlah</span><strong style="color:var(--accent)">${fmt(total)}</strong></div>
      <div class="stn-note">Harap transfer dalam 1×24 jam agar pesanan diproses.</div>
    `;
  } else if (selectedPay === 'ewallet') {
    const ewName = selectedEw || activeEw;
    const ewNum  = document.getElementById('ew-number-display').textContent;
    transferNote.style.display = 'block';
    transferNote.innerHTML = `
      <div class="stn-title">📋 Instruksi Transfer E-Wallet</div>
      <div class="stn-row"><span>E-Wallet</span><strong>${ewName}</strong></div>
      <div class="stn-row"><span>No. Tujuan</span><strong>${ewNum}</strong></div>
      <div class="stn-row"><span>Atas Nama</span><strong>ACD Bakery</strong></div>
      <div class="stn-row"><span>Jumlah</span><strong style="color:var(--accent)">${fmt(total)}</strong></div>
      <div class="stn-note">Harap transfer dalam 1×24 jam agar pesanan diproses.</div>
    `;
  } else {
    transferNote.style.display = 'none';
  }

  deductStock();

  document.getElementById('checkout-screen').classList.remove('open');
  document.getElementById('success-screen').classList.add('open');
  pendingOrderNum = null;
}

function renderCheckoutSummary() {
  const container = document.getElementById('checkout-items');
  const subtotal  = cart.reduce((a, c) => a + c.price * c.qty, 0);
  const tax       = Math.round(subtotal * 0.1);
  const total     = subtotal + tax;

  container.innerHTML = cart.map(item => `
    <div class="order-item-row">
      <span style="display:flex;align-items:center;gap:8px">
        ${item.img
          ? `<img src="${item.img}" alt="${item.name}"
                  style="width:28px;height:28px;object-fit:cover;border-radius:6px;flex-shrink:0"
                  onerror="this.style.display='none';this.nextElementSibling.style.display='inline'">`
          : ''
        }
        <span ${item.img ? 'style="display:none"' : ''}>${item.emoji}</span>
        ${item.name} ×${item.qty}
      </span>
      <span>${fmt(item.price * item.qty)}</span>
    </div>
  `).join('') + `
    <div class="order-item-row" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--cream-dark)">
      <span>Pajak (10%)</span><span>${fmt(tax)}</span>
    </div>
  `;

  document.getElementById('checkout-total-display').textContent = fmt(total);
}

/* ── Reset / New Order ──────────────────────────────────────── */
function resetAll() {
  cart            = [];
  selectedPay     = null;
  selectedBank    = null;
  selectedEw      = null;
  activeEw        = 'GoPay';
  pendingOrderNum = null;
  ewPin           = '';
  clearInterval(qrisTimerInterval);

  document.getElementById('cust-name').value = '';
  document.querySelectorAll('.pay-opt').forEach(e => e.classList.remove('selected'));
  document.querySelectorAll('.bank-btn').forEach(b => b.className = 'bank-btn');
  document.getElementById('transfer-panel').style.display = 'none';
  document.getElementById('ewallet-panel').style.display  = 'none';
  document.getElementById('transfer-info').style.display  = 'none';
  clearPin();
  updateEwDots();

  document.querySelectorAll('.ew-tab-new').forEach(t => t.classList.remove('active'));
  const firstTab = document.querySelector('.ew-tab-new');
  if (firstTab) firstTab.classList.add('active');

  updateCartBadge();
  document.getElementById('success-screen').classList.remove('open');
}

/* ── Init ───────────────────────────────────────────────────── */
buildGrid('small');
buildGrid('large');
