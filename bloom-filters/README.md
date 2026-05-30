# Bloom Filter

> Bloom filter — kichik xotira sarflab, elementning to'plamda bor-yo'qligini tezda aniqlash imkonini beruvchi ehtimoliy ma'lumotlar tuzilmasi.

## 📖 Tushuntirish

**Bloom filter** — klassik ma'lumotlar tuzilmalaridan farqli o'laroq, aniq "yo'q" (false negative yo'q), ammo kam hollarda noto'g'ri "bor" (false positive) javob berishi mumkin. Asosiy xususiyatlari:

- Xotirada juda kam joy egallaydi
- `O(1)` vaqtda qo'shish va qidirish
- Elementni o'chirish qo'llab-quvvatlanmaydi
- False positive ehtimolini oldindan sozlash mumkin

### Qanday ishlaydi?

1. Bit massivi yaratiladi (`m` bit)
2. Elementni qo'shishda `k` ta hash funksiya natijasi bo'yicha bitlar `1` ga o'rnatiladi
3. Qidirishda o'sha `k` ta bitning hammasi `1` bo'lsa — element **ehtimol bor**
4. Biron bit `0` bo'lsa — element **aniq yo'q**

```
Element: "admin"
Hash 1 → bit[42] = 1
Hash 2 → bit[87] = 1
Hash 3 → bit[13] = 1
```

---

## 📁 Fayl tuzilmasi

```
bloom-filters/
├── bloom-filter.js    — BloomFilter klassi (add, contains metodlari)
├── hash-function.js   — SHA256 asosidagi hash funksiya
├── server.js          — HTTP server (odatiy va bloom filter endpoint'lari)
├── benchmark.js       — Autocannon bilan tezlik taqqoslovi
└── package.json       — pg, autocannon library bog'liqliklari
```

### `bloom-filter.js` — asosiy klass

```js
const bf = new BloomFilter(10000, 0.01); // 10,000 element, 1% false positive
bf.add("admin");
bf.contains("admin"); // → true
bf.contains("ghost"); // → false (aniq)
```

### `server.js` — ikki endpoint

| Endpoint                         | Tavsif                                                         |
| -------------------------------- | -------------------------------------------------------------- |
| `GET /search?username=xxx`       | Ma'lumotlar bazasidan to'g'ridan-to'g'ri qidiradi              |
| `GET /search-bloom?username=xxx` | Avval bloom filterdan tekshiradi, keyin bazaga murojaat qiladi |

---

## 🚀 Ishga tushirish

### Talablar

- Node.js
- PostgreSQL (ulangan va foydalanuvchilar jadvali mavjud)

### Serverni ishga tushirish

```bash
npm install
node server.js
```

### Benchmark o'tkazish

```bash
# Avval server ishga tushirilgan bo'lishi kerak
node benchmark.js
```

Benchmark natijasi `GET /search` va `GET /search-bloom` so'rovlarining tezligini taqqoslaydi. Bloom filter bazaga ortiqcha yukni kamaytiradi.

---

## 📊 Natija misoli

```
Odatiy qidiruv:  ~1,200 req/s
Bloom filter:    ~9,800 req/s  (yo'q elementlar uchun)
```

---

## 📚 Bog'liq maqolalar

- [Bloom filters](https://habibovulugbek.medium.com/bloom-filters-f6e9e72dbe5c)
- [Bloom filters amalda: Noldan kod yozib, benchmark qilamiz](https://habibovulugbek.medium.com/bloom-filters-amalda-noldan-kod-yozib-benchmark-qilamiz-5d08bf786cc7)
