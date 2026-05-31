# Rate Limiter

Rate limiting — bu serverga kelayotgan so'rovlar sonini cheklash usuli. Bu resurslarni himoya qilish va tizim barqarorligini saqlash uchun ishlatiladi.

## Papka tuzilmasi

```
rate-limiter/
├── server.js                        # HTTP server (middleware bilan)
└── token-bucket/
    ├── rate-limiter.js              # Token Bucket implementatsiyasi
    ├── rate-limiter.test.js         # Unit testlar (serversiz)
    └── token-bucket-server.test.js  # Server integratsiya testi
```

---

## Token Bucket algoritmi

Token Bucket — eng keng tarqalgan rate limiting algoritmlaridan biri.

### Qanday ishlaydi?

```
Bucket (sig'im: 5 token)
│
├── Har soniyada N ta token qo'shiladi (refillRate)
├── Har so'rov 1 ta token sarflaydi
├── Token tugasa → so'rov rad etiladi (429)
└── Token sig'imdan oshib ketmaydi
```

### Afzalliklari

| Xususiyat              | Tavsif                                              |
| ---------------------- | --------------------------------------------------- |
| **Burst traffic**      | Qisqa muddatli ko'p so'rovlarga ruxsat beradi       |
| **Smooth refill**      | Tokenlar vaqt o'tishi bilan qayta to'ladi           |
| **Per-user isolation** | Har bir foydalanuvchi uchun alohida bucket          |
| **Lazy refill**        | Token hisoblash faqat so'rov kelganda amalga oshadi |

---

## Implementatsiya

### TokenBucket (ichki sinf)

```javascript
const bucket = new TokenBucket(capacity, refillRate);
bucket.consume(); // true → ruxsat, false → rad etildi
bucket.getCurrentState(); // { tokens, capacity, lastRefillTimestamp }
```

### TokenBucketRateLimiter (asosiy sinf)

Har bir foydalanuvchi uchun alohida bucket boshqaradi:

```javascript
const limiter = new TokenBucketRateLimiter(5, 1); // 5 token, 1 token/sekund
limiter.isAllowed("user-123"); // true yoki false
limiter.getCurrentState("user-123");
```

---

## Middleware pattern

`server.js` da rate limiter middleware sifatida ishlatiladi — Express.js dagi `(req, res, next)` pattern bilan bir xil:

```javascript
function rateLimiterMiddleware(req, res, next) {
  const userId = req.headers["x-user-id"] || "default-user";

  if (rateLimiter.isAllowed(userId)) {
    next(); // So'rovni davom ettiradi
  } else {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Limit oshib ketdi" }));
  }
}
```

**Afzalligi:** Bir middleware'ni istalgan route'ga qo'shish mumkin — route logic o'zgarmaydi.

---

## Serverni ishga tushirish

```bash
node server.js
# Server 3000-portda ishga tushdi...
```

### So'rov yuborish

```bash
# Ruxsat etilgan so'rov
curl -H "x-user-id: alice" http://localhost:3000/token-bucket

# Limit oshganda (429)
for i in {1..8}; do curl -s -o /dev/null -w "%{http_code}\n" \
  -H "x-user-id: alice" http://localhost:3000/token-bucket; done
```

---

## Testlarni ishga tushirish

```bash
# Unit testlar (server shart emas)
node token-bucket/rate-limiter.test.js

# Server integratsiya testi (avval server ishga tushirilishi kerak)
node token-bucket/token-bucket-server.test.js
```

### Unit test natijalari (11 ta test)

| Test | Tekshiradi                                  |
| ---- | ------------------------------------------- |
| 1    | Sig'im ichidagi so'rovlar qabul qilinadi    |
| 2    | Sig'imdan oshgan so'rovlar rad etiladi      |
| 3    | Tokenlar vaqt o'tishi bilan qayta to'ladi   |
| 4    | Tokenlar sig'imdan oshib ketmaydi           |
| 5    | Turli foydalanuvchilar bir-biridan mustaqil |
| 6    | Burst keyin throttle pattern ishlaydi       |

---

## Distributed sistemalarda rate limiting

Hozirgi implementatsiya single-server uchun. Distributed sistemada:

| Yondashuv                 | Latency | Aniqlik                     |
| ------------------------- | ------- | --------------------------- |
| In-memory (hozirgi)       | ~100ns  | Faqat 1 server              |
| Redis + Lua script        | ~1ms    | Barcha serverlar uchun aniq |
| Local cache + async Redis | ~100ns  | Taxminiy (tolerant)         |

Redis Lua script — atomik operatsiya, race condition yo'q, bitta network round-trip.

---

## Maqolalar

- [Rate limiting nima?](https://habibovulugbek.medium.com/rate-limiting-nima-46677adf49ad)
- [Token bucket rate limiting algoritmini 0 dan yozamiz](https://medium.com/@habibovulugbek/token-bucket-rate-limiting-algoritmini-0-dan-yozamiz-3e95f7f36490)
