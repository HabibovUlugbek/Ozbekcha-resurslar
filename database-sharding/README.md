# Database Sharding (Ma'lumotlar Bazasini Parchalash)

> Ma'lumotlarni bir nechta alohida baza serverlariga taqsimlash orqali gorizontal kengayish (horizontal scaling) ta'minlash.

## 📖 Tushuntirish

**Sharding** — ma'lumotlarni bir nechta mustaqil **shard** (baza serveri) ga bo'lish. Har bir shard faqat ma'lumotlarning bir qismini saqlaydi.

```
                        ┌─────────────┐
                        │  Shard Router│
                        │(Consistent   │
                        │  Hashing)    │
                        └──────┬───────┘
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
        ┌──────────┐     ┌──────────┐     ┌──────────┐
        │ Shard 1  │     │ Shard 2  │     │ Shard 3  │
        │(PostgreSQL│     │(PostgreSQL│     │(PostgreSQL│
        │ port 5432)│     │ port 5433)│     │ port 5434)│
        └──────────┘     └──────────┘     └──────────┘
```

Bu papkada **short-notes** ilovasi orqali sharding amalda ko'rsatilgan. **Consistent Hashing** yordamida har bir note ID si qaysi shardga borishini aniqlaydi.

---

## 📁 Fayl tuzilmasi

```
database-sharding/
├── load-test.js                  — 1000 ta POST /note so'rov yuboradi
└── short-notes-app/
    ├── server.js                 — HTTP server (POST /note, GET /note/:id)
    ├── note-handler.js           — Note yaratish/olish, node o'chirishda migratsiya
    ├── helper.js                 — generateId() funksiyasi
    ├── package.json
    └── db/
        └── shard-config.js       — 3 ta shard konfiguratsiyasi + Consistent Hashing
```

### `shard-config.js` — 3 ta shard

```js
const shards = [
  { host: "localhost", port: 5432, database: "notes_shard_1" },
  { host: "localhost", port: 5433, database: "notes_shard_2" },
  { host: "localhost", port: 5434, database: "notes_shard_3" },
];
```

### `server.js` — asosiy endpointlar

| Method | Endpoint             | Tavsif                                                        |
| ------ | -------------------- | ------------------------------------------------------------- |
| `POST` | `/note`              | Yangi note yaratadi (Consistent Hashing bilan shard tanlaydi) |
| `GET`  | `/note/:id`          | Note ID bo'yicha to'g'ri shardan oladi                        |
| `POST` | `/debug/remove-node` | Shard o'chirib, ma'lumotlarni migratsiya qiladi               |

---

## 🚀 Ishga tushirish

### 1. Uch xil portda PostgreSQL ishga tushirish

```bash
# Shard 1
docker run -d --name shard1 -e POSTGRES_DB=notes_shard_1 \
  -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres

# Shard 2
docker run -d --name shard2 -e POSTGRES_DB=notes_shard_2 \
  -e POSTGRES_PASSWORD=postgres -p 5433:5432 postgres

# Shard 3
docker run -d --name shard3 -e POSTGRES_DB=notes_shard_3 \
  -e POSTGRES_PASSWORD=postgres -p 5434:5432 postgres
```

### 2. O'rnatish va ishga tushirish

```bash
cd short-notes-app
npm install
node server.js
```

### 3. Load test

```bash
node load-test.js
# 1000 ta note yaratadi va javob vaqtlarini ko'rsatadi
```

### 4. Shard o'chirish va migratsiya sinash

```bash
curl -X POST http://localhost:3000/debug/remove-node \
  -H "Content-Type: application/json" \
  -d '{"nodeId": "shard-2"}'
# Ma'lumotlar avtomatik qolgan shardlarga ko'chiriladi
```

---

## 🔍 Sharding va Partitioning farqi

| Xususiyat         | Sharding                  | Partitioning |
| ----------------- | ------------------------- | ------------ |
| Server soni       | Ko'p (har shard alohida)  | Bitta        |
| Kengayish         | Gorizontal (yangi server) | Vertikal     |
| Murakkablik       | Yuqori                    | O'rtacha     |
| Cross-shard query | Qiyin                     | Yo'q         |

---

## 📚 Bog'liq maqolalar

- [Database sharding](https://habibovulugbek.medium.com/database-sharding-791e01d38a90)
- [Note app bilan Sharding qilamiz](https://habibovulugbek.medium.com/note-app-bilan-sharding-qilamiz-6aafd0a1d72c)
- [Consistent hashing](https://habibovulugbek.medium.com/consistent-hashing-dddfb60a9d20)
