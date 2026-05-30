# Clustering (Klasterlash)

> Node.js da `cluster` moduli yordamida ko'p protsessor yadrolaridan to'liq foydalanish va server unumdorligini oshirish usullari.

## 📖 Tushuntirish

Node.js **bir yadroda** ishlaydi, lekin zamonaviy serverlar ko'plab yadrolardan iborat. **Clustering** orqali har bir yadroda alohida Node.js jarayoni (worker) yaratib, yukni teng taqsimlash mumkin.

### Qanday ishlaydi?

```
         ┌─────────┐
         │ Primary │  ← cluster.isMaster: true
         │ (master)│
         └────┬────┘
    ┌─────────┼─────────┐
    ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐
│Worker 1│ │Worker 2│ │Worker 3│  ← har biri alohida CPU yadrosida
└────────┘ └────────┘ └────────┘
```

- **Primary** jarayon workerlarni yaratadi va boshqaradi
- **Worker** jarayonlar HTTP so'rovlarni qabul qiladi
- Yukni taqsimlash **round-robin** usulida amalga oshiriladi (Linux'da)

---

## 📁 Fayl tuzilmasi

```
clustering/
├── cluster.js                      — Oddiy cluster misoli (har yadroga 1 worker)
├── benchmark-server/
│   ├── cluster-server.js           — Klasterlangan HTTP server (benchmark uchun)
│   └── single-server.js            — Yagona process'li server (taqqoslash uchun)
└── communication/
    ├── parent-cluster.js           — Primary jarayon workerlarga xabar yuboradi
    └── worker.js                   — Worker xabar qabul qiladi va javob qaytaradi
```

---

## 🚀 Ishga tushirish

### Oddiy cluster

```bash
node cluster.js
# CPU yadrolar soniga qarab workerlar yaratiladi
```

### Benchmark: klaster vs yagona process

```bash
# Terminal 1 — yagona serverни ishga tushirish
node benchmark-server/single-server.js

# Terminal 2 — load test (autocannon yoki wrk bilan)
npx autocannon -c 100 -d 10 http://localhost:3000

# Keyin klasterlangan serverni sinash
node benchmark-server/cluster-server.js
npx autocannon -c 100 -d 10 http://localhost:3000
```

### Workerlar o'rtasida xabar almashish

```bash
node communication/parent-cluster.js
# Primary workerlariga xabar yuboradi, workerlar javob qaytaradi
```

---

## 🔍 Cluster vs Worker Threads

| Xususiyat | Cluster                               | Worker Threads             |
| --------- | ------------------------------------- | -------------------------- |
| Xotira    | Alohida (izolyatsiya)                 | Umumiy (SharedArrayBuffer) |
| Jarayon   | Alohida OS jarayonlari                | Bir jarayon ichida         |
| Xatolar   | Bir worker tushsa, qolganlar ishlaydi | —                          |
| Maqsad    | HTTP serverni scale qilish            | CPU-intensive hisoblashlar |

---

## 📚 Bog'liq maqolalar

- [Nodejsda Clustering](https://habibovulugbek.medium.com/nodejsda-clustering-c11125c6057e)
- [Nodejs single threadmi yoki multi thread?](https://habibovulugbek.medium.com/nodejs-single-threadmi-yoki-multi-thread-062e129159b7)
