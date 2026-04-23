/**
 * data.js — ACD Bakery Kiosk
 * ─────────────────────────────────────────────────────────────
 * CARA GANTI NAMA / HARGA / FOTO PRODUK:
 *
 *  • name   → nama produk yang tampil di kartu
 *  • flavor → label kecil di bawah nama (huruf kapital)
 *  • price  → harga dalam Rupiah (angka, tanpa titik)
 *  • desc   → deskripsi panjang yang muncul di popup detail
 *  • img    → path foto produk, contoh: "images/pandan.jpg"
 *             Letakkan foto di folder  images/  di dalam folder proyek.
 *             Kosongkan ("") untuk tetap pakai emoji sebagai fallback.
 *  • emoji  → ditampilkan jika img kosong atau foto gagal dimuat
 *  • rating → nilai bintang produk (1.0 – 5.0)
 *  • stock  → jumlah stok tersedia (berkurang otomatis saat order dikonfirmasi)
 * ─────────────────────────────────────────────────────────────
 */

const products = {
  small: [
    {
      id: 's1',
      emoji: '🍃',
      img: 'img/smallspesial.jpg',
      name: 'Spesial Premium',
      flavor: 'SPESIAL BIKIN NAGIH',
      price: 17000,
      rating: 4.8,
      stock: 20,
      desc: 'Satu paket tiga kebahagiaan! Dapatkan trio rasa terbaik dalam satu kemasan — wangi pandan alami yang menenangkan, coklat premium yang kaya dan meleleh, serta keju gurih yang bikin nagih. Pilihan sempurna buat kamu yang nggak mau pilih satu rasa saja!'
    },
    {
      id: 's2',
      emoji: '🍫',
      img: 'img/smallcoklat.jpg',
      name: 'Triple Choco Delight',
      flavor: 'NYOCOKLAT BANGET',
      price: 18000,
      rating: 4.9,
      stock: 15,
      desc: 'Ledakan coklat premium di setiap gigitan — lembut, moist, dan kaya rasa. Dibuat dari bubuk coklat pilihan yang menghadirkan sensasi manis pahit yang sempurna.'
    },
    {
      id: 's3',
      emoji: '🧀',
      img: 'img/smallkeju.jpg',
      name: 'Cheese Royale',
      flavor: 'KEJU SPECIAL',
      price: 19000,
      rating: 4.7,
      stock: 10,
      desc: 'Gurihnya keju pilihan berpadu dengan kelembutan bolu kukus yang sempurna. Aroma keju yang harum langsung tercium begitu dibuka — cocok buat kamu yang suka rasa savory-sweet.'
    },
    {
      id: 's4',
      emoji: '🍓',
      img: 'img/smallmatcha.jpg',
      name: 'Matcha Supreme',
      flavor: 'MATCHA BANGET',
      price: 18000,
      rating: 4.6,
      stock: 12,
      desc: 'Perpaduan unik antara kelembutan bolu kukus dan kepahitan khas matcha Jepang berkualitas tinggi. Aroma greentea yang harum bikin setiap gigitan terasa mewah dan menyegarkan.'
    },
    {
      id: 's5',
      emoji: '🥥',
      img: 'img/smallvanilla.jpg',
      name: 'Classic Vanilla Bliss',
      flavor: 'VANILLA PREMIUM',
      price: 17000,
      rating: 4.5,
      stock: 18,
      desc: 'Klasik yang tak pernah gagal — bolu kukus dengan ekstrak vanilla asli yang memberikan aroma harum dan rasa manis lembut yang memanjakan lidah. Simpel, elegan, dan selalu pas di hati.'
    },
    {
      id: 's6',
      emoji: '🍋',
      img: 'img/smalltiramitsu.jpg',
      name: 'Tiramisu Elegance',
      flavor: 'TIRAMITSU PREMIUM',
      price: 20000,
      rating: 4.9,
      stock: 8,
      desc: 'Inspirasi dari dessert Italia yang legendaris — bolu kukus dengan sentuhan kopi espresso lembut dan aroma krim yang menggoda. Manis, sedikit pahit, dan bikin ketagihan.'
    }
  ],

  large: [
    {
      id: 'l1',
      emoji: '🌿',
      img: 'img/largespesial.jpg',
      name: 'Spesial Premium',
      flavor: 'SPESIAL BIKIN TAGIH',
      price: 38000,
      rating: 4.8,
      stock: 10,
      desc: 'Satu paket tiga kebahagiaan! Dapatkan trio rasa terbaik dalam satu kemasan — wangi pandan alami yang menenangkan, coklat premium yang kaya dan meleleh, serta keju gurih yang bikin nagih. Pilihan sempurna buat kamu yang nggak mau pilih satu rasa saja!'
    },
    {
      id: 'l2',
      emoji: '🎭',
      img: 'img/largecoklat.jpg',
      name: 'Triple Choco Delight',
      flavor: 'NYOCOKLAT BANGET',
      price: 42000,
      rating: 4.9,
      stock: 7,
      desc: 'Ledakan coklat premium di setiap gigitan — lembut, moist, dan kaya rasa. Dibuat dari bubuk coklat pilihan yang menghadirkan sensasi manis pahit yang sempurna.'
    },
    {
      id: 'l3',
      emoji: '🏆',
      img: 'img/largekeju.jpg',
      name: 'Cheese Royale',
      flavor: 'KEJU SPECIAL',
      price: 45000,
      rating: 4.7,
      stock: 5,
      desc: 'Gurihnya keju pilihan berpadu dengan kelembutan bolu kukus yang sempurna. Aroma keju yang harum langsung tercium begitu dibuka — cocok buat kamu yang suka rasa savory-sweet.'
    },
    {
      id: 'l4',
      emoji: '🌸',
      img: 'img/largematcha.jpg',
      name: 'Matcha Supreme',
      flavor: 'MATCHA BANGET',
      price: 40000,
      rating: 4.6,
      stock: 9,
      desc: 'Perpaduan unik antara kelembutan bolu kukus dan kepahitan khas matcha Jepang berkualitas tinggi. Aroma greentea yang harum bikin setiap gigitan terasa mewah dan menyegarkan.'
    },
    {
      id: 'l5',
      emoji: '🌴',
      img: 'img/largevanilla.jpg',
      name: 'Classic Vanilla Bliss',
      flavor: 'VANILLA PREMIUM',
      price: 38000,
      rating: 4.5,
      stock: 11,
      desc: 'Klasik yang tak pernah gagal — bolu kukus dengan ekstrak vanilla asli yang memberikan aroma harum dan rasa manis lembut yang memanjakan lidah. Simpel, elegan, dan selalu pas di hati.'
    },
    {
      id: 'l6',
      emoji: '✨',
      img: 'img/largetiramitsu.jpg',
      name: 'Tiramisu Elegance',
      flavor: 'TIRAMITSU PREMIUM',
      price: 43000,
      rating: 4.8,
      stock: 6,
      desc: 'Inspirasi dari dessert Italia yang legendaris — bolu kukus dengan sentuhan kopi espresso lembut dan aroma krim yang menggoda. Manis, sedikit pahit, dan bikin ketagihan.'
    }
  ]
};