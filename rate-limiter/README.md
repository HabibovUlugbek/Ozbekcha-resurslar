# Rate Limiter

Rate limiting — bu serverga kelayotgan so'rovlar sonini cheklash usuli. Bu resurslarni himoya qilish va tizim barqarorligini saqlash uchun ishlatiladi.

## Papka tuzilmasi

```
rate-limiter/
├── server.js                                       # HTTP server (5 ta endpoint)
├── token-bucket/
│   ├── rate-limiter.js                             # Token Bucket implementatsiyasi
│   ├── rate-limiter.test.js                        # Unit testlar (serversiz)
│   └── token-bucket-server.test.js                 # Server integratsiya (e2e) testi
├── leaky-bucket/
│   ├── rate-limiter.js                             # Leaky Bucket implementatsiyasi
│   ├── rate-limiter.test.js                        # Unit testlar (serversiz)
│   └── leaky-bucket-server.test.js                 # Server integratsiya (e2e) testi
├── fixed-window/
│   ├── rate-limiter.js                             # Fixed Window implementatsiyasi
│   ├── rate-limiter.test.js                        # Unit testlar (serversiz)
│   └── fixed-window-server.test.js                 # Server integratsiya (e2e) testi
├── sliding-window-log/
│   ├── rate-limiter.js                             # Sliding Window Log implementatsiyasi
│   ├── rate-limiter.test.js                        # Unit testlar (serversiz)
│   └── sliding-window-log-server.test.js           # Server integratsiya (e2e) testi
└── sliding-window-counter/
    ├── rate-limiter.js                             # Sliding Window Counter implementatsiyasi
    ├── rate-limiter.test.js                        # Unit testlar (serversiz)
    └── sliding-window-counter-server.test.js       # Server integratsiya (e2e) testi
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

## Leaky Bucket algoritmi

Leaky Bucket — so'rovlarni **navbatga qo'yib, doimiy tezlikda** qayta ishlaydigan algoritm (traffic shaping). Teshigi bor chelakka o'xshaydi: suv (so'rovlar) tepadan tushadi, pastdan bir tekis oqib chiqadi.

### Qanday ishlaydi?

```
Bucket (navbat sig'imi: 5)
│
├── Har so'rov navbatga qo'yiladi (fill)
├── Navbat to'la bo'lsa → so'rov rad etiladi (429)
├── So'rovlar doimiy tezlikda oqib chiqadi (consumeRate: N/sek)
└── Qabul qilingan so'rov navbatdan oqib chiqqanda qayta ishlanadi
```

### Token Bucket bilan farqi

| Xususiyat        | Token Bucket                       | Leaky Bucket                          |
| ---------------- | ---------------------------------- | ------------------------------------- |
| **Burst**        | Ruxsat beradi (token zaxirasi)     | Yo'q — chiqish tezligi doim bir tekis |
| **Chiqish oqimi** | Notekis bo'lishi mumkin            | Doimiy, silliq (traffic shaping)      |
| **Javob vaqti**  | Sinxron (darhol allow/deny)        | Qabul qilingan so'rov kutadi (paced)  |
| **Model**        | `isAllowed()` → `true`/`false`     | `schedule()` → `Promise`              |

### LeakyBucket (ichki sinf)

```javascript
const bucket = new LeakyBucket(capacity, consumeRate);
bucket.fill(request); // true → navbatga qo'shildi, false → navbat to'la
bucket.startLeaking(); // fon taymerini boshlaydi (so'rovlarni oqizadi)
bucket.getCurrentState(); // { queued, capacity, consumeRate, isLeaking }
```

### LeakyBucketRateLimiter (asosiy sinf)

Har bir foydalanuvchi uchun alohida bucket boshqaradi. Token Bucketdan farqi — `schedule()` **Promise** qaytaradi: qabul qilingan so'rov navbatdan oqib chiqqanda `true` bilan, navbat to'la bo'lsa darhol `false` bilan hal bo'ladi.

```javascript
const limiter = new LeakyBucketRateLimiter(5, 1); // 5 navbat, 1 so'rov/sekund
const accepted = await limiter.schedule("user-123"); // true (oqdi) yoki false (rad)
limiter.getCurrentState("user-123");
limiter.stopAll(); // barcha fon taymerlarini to'xtatadi
```

---

## Fixed Window algoritmi

Fixed Window — eng oddiy algoritm: vaqt qat'iy intervallarga (masalan har 1 sekund) bo'linadi va har intervalda so'rovlar sanaladi. Interval tugaganda hisob nolga tushadi.

### Qanday ishlaydi?

```
Interval (sig'im: 5 so'rov / 1 sekund)
│
├── Har so'rov joriy interval hisobini oshiradi
├── Hisob sig'imga yetsa → so'rov rad etiladi (429)
├── Interval muddati tugaganda hisob nolga tushadi
└── Yangi interval to'liq sig'im bilan boshlanadi
```

### Kamchiligi — interval chegarasi (boundary) muammosi

Ikki qo'shni intervalning chegarasida qisqa vaqt ichida ikki barobar so'rov o'tishi mumkin: birinchi interval oxirida 5 ta, keyingi interval boshida yana 5 ta → ~1 sekund ichida 10 ta. Sliding Window bu muammoni hal qiladi.

```javascript
const limiter = new FixedWindowRateLimiter(5, 1000); // 5 so'rov / 1000ms interval
limiter.isAllowed("user-123"); // true yoki false
limiter.getCurrentState("user-123"); // { requestCount, capacity, windowResetAt }
```

---

## Sliding Window Log algoritmi

Sliding Window Log — har bir so'rovning aniq vaqtini (timestamp) jurnalda saqlaydi va faqat "hozirgi paytdan orqaga bitta interval" ichiga tushadigan so'rovlarni sanaydi. Interval doim siljib turadi, shuning uchun Fixed Window'dagi chegara muammosi yo'q.

### Qanday ishlaydi?

```
Interval (sig'im: 5 so'rov, siljuvchi 1 sekund)
│
├── Har so'rovning timestampi jurnalga qo'shiladi
├── Har tekshiruvda intervaldan chiqib ketgan (eski) timestamplar olib tashlanadi
├── Jurnaldagi yozuvlar soni sig'imga yetsa → so'rov rad etiladi (429)
└── Interval uzluksiz siljiydi (qat'iy chegara yo'q)
```

### Fixed Window bilan farqi

| Xususiyat        | Fixed Window                     | Sliding Window Log                 |
| ---------------- | -------------------------------- | ---------------------------------- |
| **Aniqlik**      | Chegara burst muammosi bor       | Aniq — chegara muammosi yo'q       |
| **Xotira**       | Kam (faqat bitta hisoblagich)    | Ko'proq (har so'rov timestampi)    |
| **Interval**     | Qat'iy, birdan nolga tushadi     | Uzluksiz siljiydi                  |

```javascript
const limiter = new SlidingWindowLogRateLimiter(1000, 5); // 1000ms siljuvchi interval, 5 so'rov
limiter.isAllowed("user-123"); // true yoki false
limiter.getCurrentState("user-123"); // { count, capacity, remaining, oldestTimestamp }
```

---

## Sliding Window Counter algoritmi

Sliding Window Counter — Fixed Window'ning chegara muammosini kam xotira bilan yumshatadigan algoritm. Har so'rov uchun timestamp saqlamaydi (Sliding Window Log'dan farqi), faqat ikkita hisoblagich yuritadi: joriy interval va oldingi interval. Joriy hisobga oldingi interval hisobining **vaznlangan** qismi qo'shiladi.

### Qanday ishlaydi?

```
Interval (sig'im: 5 so'rov / 1 sekund)
│
├── currentCount — joriy intervaldagi so'rovlar
├── previousCount — oldingi intervaldagi so'rovlar
├── Taxminiy hisob = previousCount * prevWeight + currentCount
│     prevWeight = 1 - (interval ichida o'tgan vaqt / interval uzunligi)
├── Taxminiy hisob sig'imga yetsa → so'rov rad etiladi (429)
└── Interval o'tganda currentCount → previousCount ga suriladi
```

### Sliding Window Log bilan farqi

| Xususiyat        | Sliding Window Log               | Sliding Window Counter             |
| ---------------- | -------------------------------- | ---------------------------------- |
| **Xotira**       | Har so'rov uchun timestamp       | Faqat 2 ta hisoblagich             |
| **Aniqlik**      | Aniq                             | Taxminiy (vaznlangan)              |
| **Chegara burst**| Yo'q                             | Yumshatilgan (deyarli yo'q)        |

```javascript
const limiter = new SlidingWindowCounterRateLimiter(1000, 5); // 1000ms interval, 5 so'rov
limiter.isAllowed("user-123"); // true yoki false
limiter.getCurrentState("user-123"); // { previousCount, currentCount, estimated, capacity, windowEndsAt }
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

# Token bucket — limit oshganda (429)
for i in {1..8}; do curl -s -o /dev/null -w "%{http_code}\n" \
  -H "x-user-id: alice" http://localhost:3000/token-bucket; done

# Leaky bucket — parallel so'rovlar (navbat to'lganda 429)
for i in {1..8}; do curl -s -o /dev/null -w "%{http_code}\n" \
  -H "x-user-id: bob" http://localhost:3000/leaky-bucket & done; wait

# Fixed window — interval limiti oshganda (429)
for i in {1..8}; do curl -s -o /dev/null -w "%{http_code}\n" \
  -H "x-user-id: carol" http://localhost:3000/fixed-window; done

# Sliding window log — siljuvchi interval limiti oshganda (429)
for i in {1..8}; do curl -s -o /dev/null -w "%{http_code}\n" \
  -H "x-user-id: dave" http://localhost:3000/sliding-window-log; done

# Sliding window counter — vaznlangan interval limiti oshganda (429)
for i in {1..8}; do curl -s -o /dev/null -w "%{http_code}\n" \
  -H "x-user-id: erin" http://localhost:3000/sliding-window-counter; done
```

---

## Testlarni ishga tushirish

```bash
# Unit testlar (server shart emas)
node token-bucket/rate-limiter.test.js
node leaky-bucket/rate-limiter.test.js
node fixed-window/rate-limiter.test.js
node sliding-window-log/rate-limiter.test.js
node sliding-window-counter/rate-limiter.test.js

# Server integratsiya (e2e) testlari (avval server ishga tushirilishi kerak)
node token-bucket/token-bucket-server.test.js
node leaky-bucket/leaky-bucket-server.test.js
node fixed-window/fixed-window-server.test.js
node sliding-window-log/sliding-window-log-server.test.js
node sliding-window-counter/sliding-window-counter-server.test.js
```

### Token Bucket — unit test natijalari (6 ta test)

| Test | Tekshiradi                                  |
| ---- | ------------------------------------------- |
| 1    | Sig'im ichidagi so'rovlar qabul qilinadi    |
| 2    | Sig'imdan oshgan so'rovlar rad etiladi      |
| 3    | Tokenlar vaqt o'tishi bilan qayta to'ladi   |
| 4    | Tokenlar sig'imdan oshib ketmaydi           |
| 5    | Turli foydalanuvchilar bir-biridan mustaqil |
| 6    | Burst keyin throttle pattern ishlaydi       |

### Leaky Bucket — unit test natijalari (6 ta test)

| Test | Tekshiradi                                       |
| ---- | ------------------------------------------------ |
| 1    | Sig'im ichidagi so'rovlar navbatga qo'yiladi     |
| 2    | Navbat to'lganda so'rovlar rad etiladi           |
| 3    | So'rovlar doimiy tezlikda oqib chiqadi           |
| 4    | Navbat sig'imdan oshib ketmaydi                  |
| 5    | Turli foydalanuvchilar bir-biridan mustaqil      |
| 6    | Qabul qilingan so'rov oqqandan keyin hal bo'ladi |

### Fixed Window — unit test natijalari (6 ta test)

| Test | Tekshiradi                                       |
| ---- | ------------------------------------------------ |
| 1    | Sig'im ichidagi so'rovlar qabul qilinadi         |
| 2    | Sig'imdan oshgan so'rovlar rad etiladi           |
| 3    | Interval tugagach hisob nolga tushadi            |
| 4    | Hisob sig'imdan oshib ketmaydi                   |
| 5    | Turli foydalanuvchilar bir-biridan mustaqil      |
| 6    | Interval chegarasida burst muammosi (kamchilik)  |

### Sliding Window Log — unit test natijalari (6 ta test)

| Test | Tekshiradi                                       |
| ---- | ------------------------------------------------ |
| 1    | Sig'im ichidagi so'rovlar qabul qilinadi         |
| 2    | Sig'imdan oshgan so'rovlar rad etiladi           |
| 3    | Eski timestamplar intervaldan chiqib ketadi      |
| 4    | Log sig'imdan oshib ketmaydi                     |
| 5    | Turli foydalanuvchilar bir-biridan mustaqil      |
| 6    | Interval chegarasida burst bo'lmaydi (ustunlik)  |

### Sliding Window Counter — unit test natijalari (6 ta test)

| Test | Tekshiradi                                       |
| ---- | ------------------------------------------------ |
| 1    | Sig'im ichidagi so'rovlar qabul qilinadi         |
| 2    | Sig'imdan oshgan so'rovlar rad etiladi           |
| 3    | Ikki interval o'tgach hisob nolga tushadi        |
| 4    | Taxminiy hisob sig'imdan oshib ketmaydi          |
| 5    | Turli foydalanuvchilar bir-biridan mustaqil      |
| 6    | Interval chegarasidagi burst yumshatiladi        |

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
