# Database Replication (Ma'lumotlar Bazasini Nusxalash)

> Bir ma'lumotlar bazasidagi o'zgarishlarni avtomatik ravishda boshqa bazalarga nusxalab, yuqori mavjudlik (high availability) va o'qish unumdorligini ta'minlash.

## 📖 Tushuntirish

**Replication** — bitta **Primary** (asosiy) baza serveridagi barcha yozuvlar bir yoki bir nechta **Replica** (nusxa) serverlarga real-time yoki qisqa kechikish bilan ko'chiriladi.

```
┌─────────────┐    WAL logs    ┌──────────────┐
│   Primary    │ ─────────────▶ │   Replica 1  │ (o'qish uchun)
│  (yozish)   │                └──────────────┘
│             │ ─────────────▶ ┌──────────────┐
└─────────────┘                │   Replica 2  │ (o'qish uchun)
                               └──────────────┘
```

### Replication turlari

| Tur                | Tavsif                                                            |
| ------------------ | ----------------------------------------------------------------- |
| **Synchronous**    | Primary replica tasdiqlagunga qadar kutadi (ma'lumot yo'qolmaydi) |
| **Asynchronous**   | Primary javob qaytaradi, replica keyinroq yangilanadi (tezroq)    |
| **Logical**        | Faqat ma'lum jadvallar nusxalanadi                                |
| **Physical (WAL)** | Butun baza stream sifatida nusxalanadi                            |

### Nima uchun kerak?

- **High Availability** — Primary tushsa, replica Primary bo'ladi (failover)
- **Read Scaling** — O'qish so'rovlarini replicalarga yo'naltirish
- **Backup** — Issiq zahira nusxa
- **Geografik taqsimlash** — Foydalanuvchiga yaqin serverdan o'qish

---

## 📁 Papka tuzilmasi

> **Eslatma:** Bu papka hozircha bo'sh. Implementatsiya rejalashtirilmoqda.

Rejalashtirilgan fayllar:

```
database-replication/
├── docker-compose.yml    — Primary + Replica PostgreSQL konteynerlar
├── setup-replication.sh  — Replikatsiyani sozlash skripti
├── read-from-replica.js  — O'qish so'rovlarini replicaga yo'naltirish
└── write-to-primary.js   — Yozish so'rovlarini primaryga yo'naltirish
```

---

## 🔧 PostgreSQL Replication — Qo'lda sozlash (kontseptsiya)

### 1. Primary serverda

```sql
-- Replikatsiya foydalanuvchisi yaratish
CREATE USER replicator REPLICATION LOGIN PASSWORD 'secret';
```

```ini
# postgresql.conf
wal_level = replica
max_wal_senders = 3
```

### 2. Replica serverda

```bash
pg_basebackup -h primary_host -U replicator -D /var/lib/postgresql/data -P -R
```

### 3. Replica avtomatik Primary bilan sinxronlashadi

---

## 🔍 Replication vs Partitioning

| Xususiyat | Replication               | Partitioning                 |
| --------- | ------------------------- | ---------------------------- |
| Maqsad    | Mavjudlik, o'qish tezligi | Katta jadvallarni boshqarish |
| Ma'lumot  | Bir xil nusxalar          | Bo'lingan ma'lumotlar        |
| Server    | Bir nechta                | Bitta (yoki bir nechta)      |

---

## 📚 Bog'liq maqolalar

- [Database Replication](https://habibovulugbek.medium.com/database-replication-636c19042fb7)
- [Strong vs Eventual consistency](https://habibovulugbek.medium.com/strong-vs-eventual-consistency-d7d1855453ab)
- [Single point of failure (SPOF)](https://medium.com/@habibovulugbek/single-point-of-failure-spof-291485d18ba0)
