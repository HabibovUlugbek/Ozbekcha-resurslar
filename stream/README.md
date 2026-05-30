# Stream (Ma'lumot Oqimlari)

> Node.js da streamlar yordamida katta hajmdagi ma'lumotlarni xotirada to'liq saqlamasdan, bo'laklab qayta ishlash.

## 📖 Tushuntirish

**Stream** — ma'lumotlarni qismlarga bo'lib qayta ishlash mexanizmi. 1 GB faylni to'liq xotiraga yuklamasdan, oz-ozdan o'qib ishlash mumkin.

### Stream turlari

| Tur           | Tavsif                     | Misol                     |
| ------------- | -------------------------- | ------------------------- |
| **Readable**  | Faqat o'qish               | Fayl o'qish, HTTP so'rovi |
| **Writable**  | Faqat yozish               | Fayl yozish, HTTP javobi  |
| **Duplex**    | Ikki tomon                 | TCP socket                |
| **Transform** | O'qib, o'zgartirib, yozadi | Gzip, Shifrlash           |

### Backpressure

Writable stream sekin ishlasa, Readable stream to'xtaydi. Bu xotira to'lib ketishining oldini oladi.

---

## 📁 Fayl tuzilmasi

```
stream/
├── stream-usage/
│   ├── fs-promise-solution.js      — Promise asosida (9.3s, 50-60MB)
│   ├── fs-callback-solution.js     — Callback asosida (1.4s, 1GB xotira!)
│   ├── fs-sync-solution.js         — Sinxron (1.8s, 40MB)
│   ├── naive-stream-solution.js    — Sodda stream (1s)
│   └── better-stream-solution.js   — Backpressure bilan (245ms, 30MB) ⭐
├── custom-readable-stream/
│   ├── readableStream.js           — Fayl o'quvchi custom Readable stream
│   ├── index.js                    — Foydalanish misoli
│   └── input.txt                   — Test fayli
├── custom-writable-stream/
│   ├── writableStream.js           — Faylga yozuvchi custom Writable stream
│   ├── index.js                    — Foydalanish misoli
│   └── output.txt                  — Natija fayli
└── custom-duplex-stream/
    ├── duplexStream.js             — Bir vaqtda o'qib va yozuvchi Duplex stream
    ├── index.js                    — Foydalanish misoli
    ├── read.txt                    — O'qish fayli
    └── write.txt                   — Yozish fayli
```

---

## 🚀 Ishga tushirish

### Stream benchmark (1 million sonni faylga yozish)

```bash
cd stream-usage

# Promise asosida (eng sekin, xotira o'rtacha)
node fs-promise-solution.js

# Callback (tez, lekin 1GB xotira sarflaydi!)
node fs-callback-solution.js

# Sinxron (o'rtacha)
node fs-sync-solution.js

# Sodda stream
node naive-stream-solution.js

# Backpressure bilan optimallashtrilgan (eng tez va kam xotira) ⭐
node better-stream-solution.js
```

### Custom Readable Stream

```bash
cd custom-readable-stream
node index.js
# input.txt ni stream orqali o'qib konsolga chiqaradi
```

### Custom Writable Stream

```bash
cd custom-writable-stream
node index.js
# Ma'lumotni stream orqali output.txt ga yozadi
```

### Custom Duplex Stream

```bash
cd custom-duplex-stream
node index.js
# read.txt dan o'qiydi, write.txt ga yozadi
```

---

## 📊 Benchmark natijalari (1M son faylga yozish)

| Yechim              | Vaqt      | Xotira       |
| ------------------- | --------- | ------------ |
| Promise fs          | 9.3s      | 50-60 MB     |
| Callback fs         | 1.4s      | ~1 GB ❌     |
| Sinxron fs          | 1.8s      | 40 MB        |
| Sodda stream        | 1s        | 35 MB        |
| Backpressure stream | **245ms** | **30 MB** ⭐ |

---

## 📚 Bog'liq maqolalar

- [Stream nima? Nodejs ortida streamlar qanday ishlaydi?](https://habibovulugbek.medium.com/stream-nima-nodejsda-ortida-streamlar-qanday-ishlaydi-77256825ec51)
- [Custom streamlar yozamiz (Nodejs)](https://habibovulugbek.medium.com/custom-streamlar-yozamiz-nodejs-65eaf08185e7)
- [Streamni benchmark qilamiz (nodejs)](https://habibovulugbek.medium.com/streamni-benchmark-qilamiz-nodejs-4aa153c614f2)
- [Stream orqali chat app quramiz](https://habibovulugbek.medium.com/stream-orqali-chat-app-quramiz-2766cd7a1135)
- [Buffer haqida bilib olamiz (Nodejs)](https://habibovulugbek.medium.com/buffer-haqida-bilib-olamiz-nodejs-9e8193c387da)

Rasmiy hujjatlar: [Node.js Stream API](https://nodejs.org/api/stream.html)
