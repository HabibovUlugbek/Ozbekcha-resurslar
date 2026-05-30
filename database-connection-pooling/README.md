# Database Connection Pooling (Ulanishlar Havzasi)

> Ma'lumotlar bazasiga har safar yangi ulanish o'rniga, tayyor ulanishlar to'plamidan qayta foydalanish orqali ishlashni tezlashtirish.

## 📖 Tushuntirish

Ma'lumotlar bazasiga har so'rovda yangi TCP ulanish o'rnatish **qimmat** (10–100ms sarflaydi). **Connection Pool** — oldindan tayyor ulanishlar havzasini saqlaydi va ularni qayta ishlatadi.

```
┌─────────────┐        ┌──────────────────┐        ┌──────────┐
│   Klientlar  │──────▶ │  Connection Pool  │──────▶ │PostgreSQL│
│ (100 ta req) │        │  (20 ta ulanish)  │        │          │
└─────────────┘        └──────────────────┘        └──────────┘
```

### Farq

| Xususiyat          | Yagona ulanish             | Connection Pool |
| ------------------ | -------------------------- | --------------- |
| Ulanish vaqti      | Har safar yangi (10-100ms) | Tayyor (0ms)    |
| Parallel so'rovlar | ❌ ketma-ket               | ✅ parallel     |
| Xotira             | Kam                        | O'rtacha        |
| Unumdorlik         | Past                       | Yuqori          |

---

## 📁 Fayl tuzilmasi

```
database-connection-pooling/
├── simple-api.js           — Yagona Client ulanish misoli (ketma-ket)
├── api-with-pooling.js     — Pool bilan parallel ulanish (max 20, 30s idle)
├── transaction-with-pooling — Tranzaksiya + pool birgalikda ishlatish
└── package.json
```

### `simple-api.js` — yagona ulanish

```js
const client = new Client(config);
await client.connect();
// Har so'rov ketma-ket bajariladi
```

### `api-with-pooling.js` — pool

```js
const pool = new Pool({
  max: 20, // maksimal ulanishlar soni
  idleTimeoutMillis: 30000, // 30 soniy bo'sh tursa yopiladi
});
// Pool avtomatik ulanish beradi va qaytarib oladi
```

---

## 🚀 Ishga tushirish

### Talablar

- Node.js
- PostgreSQL ishga tushirilgan bo'lishi kerak

### O'rnatish

```bash
npm install
```

### Yagona ulanish

```bash
node simple-api.js
```

### Pool bilan

```bash
node api-with-pooling.js
```

### Benchmark o'tkazish (taqqoslash)

```bash
# Terminal 1 — yagona ulanish serveri
node simple-api.js

# Terminal 2 — load test
npx autocannon -c 50 -d 10 http://localhost:3000

# Keyin pool versiyasini sinang
node api-with-pooling.js
npx autocannon -c 50 -d 10 http://localhost:3000
```

---

## 📚 Bog'liq maqolalar

- [Connection pooling (benchmark bilan)](https://habibovulugbek.medium.com/connection-pooling-benchmark-bilan-30246ba17d70)
- [Tranzaksiya nima? (Siz bilmagan ma'lumotlar)](https://habibovulugbek.medium.com/tranzaksiya-nima-siz-bilmagan-malumotlar-701d04470b0e)
