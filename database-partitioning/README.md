# Database Partitioning (Ma'lumotlar Bazasini Bo'laklash)

> Katta jadvallarni mantiqiy bo'laklarga bo'lib, so'rov tezligini va boshqaruvini yaxshilash.

## 📖 Tushuntirish

**Partitioning** — bitta katta jadvalni bir nechta kichik bo'laklarga (partition) bo'lish. Barchasi bir xil bazada turadi, lekin ma'lumotlar bo'laklarga ajratilgan.

### Qachon kerak?

- Jadvalda millionlab qatorlar bo'lganda
- Ko'pincha ma'lum bir diapazon bo'yicha qidirganda
- Eski ma'lumotlarni tez o'chirib tashlash kerak bo'lganda

### Partitioning turlari

| Tur       | Tavsif                           | Misol                        |
| --------- | -------------------------------- | ---------------------------- |
| **RANGE** | Qiymat oralig'i bo'yicha         | Baholar: 0–40, 40–70, 70–100 |
| **LIST**  | Aniq qiymatlar ro'yxati bo'yicha | Mamlakat: 'UZ', 'RU', 'US'   |
| **HASH**  | Hash funksiya bo'yicha           | id % 4 = 0, 1, 2, 3          |

---

## 📁 Fayl tuzilmasi

```
database-partitioning/
├── automate-partitioning.js   — PostgreSQL da RANGE partition yaratadi
├── million-row-script.js      — 10 million qator generatsiya qiladi
├── docker-commands.txt        — PostgreSQL ni Docker bilan ishga tushirish
└── package.json               — pg, @faker-js/faker bog'liqliklari
```

### `automate-partitioning.js` — nima qiladi?

`students_parts` jadvalini `grade` ustuni bo'yicha 4 ta partitionga bo'ladi:

```sql
-- Grade 0–40 (past baholar)
CREATE TABLE students_parts_low PARTITION OF students_parts
    FOR VALUES FROM (0) TO (40);

-- Grade 40–70 (o'rta baholar)
CREATE TABLE students_parts_mid PARTITION OF students_parts
    FOR VALUES FROM (40) TO (70);

-- Grade 70–80 (yuqori)
CREATE TABLE students_parts_high PARTITION OF students_parts
    FOR VALUES FROM (70) TO (80);

-- Grade 80–100 (a'lo)
CREATE TABLE students_parts_excellent PARTITION OF students_parts
    FOR VALUES FROM (80) TO (100);
```

---

## 🚀 Ishga tushirish

### PostgreSQL ni Docker bilan ishga tushirish

```bash
# docker-commands.txt faylidagi buyruqni bajaring
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:latest
```

### O'rnatish

```bash
npm install
```

### Partition jadvallarini yaratish

```bash
node automate-partitioning.js
```

### 10 million qator qo'shish

```bash
node million-row-script.js
# Sekin — @faker-js/faker bilan tasodifiy ma'lumot generatsiya qiladi
```

### Partition qidiruvini sinash (psql orqali)

```sql
-- Faqat bitta partition skanlanadi (partition pruning)
EXPLAIN ANALYZE
SELECT * FROM students_parts WHERE grade BETWEEN 70 AND 80;
```

---

## 🔍 Partitioning vs Sharding

| Xususiyat   | Partitioning           | Sharding             |
| ----------- | ---------------------- | -------------------- |
| Joylashuv   | Bir xil baza serverida | Turli serverlarda    |
| Maqsad      | So'rov tezligi         | Gorizontal kengayish |
| Murakkablik | Oddiy                  | Murakkab             |

---

## 📚 Bog'liq maqolalar

- [Database Partitioning (demo bilan)](https://habibovulugbek.medium.com/database-partitioning-demo-bilan-31897de181cc)
- [Database sharding](https://habibovulugbek.medium.com/database-sharding-791e01d38a90)
