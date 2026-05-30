# Worker Threads (Ishchi Iplar)

> Node.js da `worker_threads` moduli yordamida CPU-intensive vazifalarni parallel bajarish va main thread ni band qilmaslik.

## 📖 Tushuntirish

Node.js **event loop** asosida ishlaydi va uzoq davom etadigan hisoblashlar (CPU-intensive) butun serverni bloklaydi. **Worker Threads** yordamida bu hisoblashlarni alohida thread'larda bajara olamiz.

```
Main Thread (Event Loop)
    ├── HTTP so'rovlarni qabul qiladi  ✅
    ├── Worker 1 ga fib(40) yuboradi   ──▶ Worker 1: fib hisoblaydi
    ├── Worker 2 ga fib(41) yuboradi   ──▶ Worker 2: fib hisoblaydi
    └── Javob kelguncha boshqa so'rov   ──▶ Worker 3: fib hisoblaydi
        qabul qiladi                   ✅
```

### Worker Threads vs Child Process

| Xususiyat | Worker Threads                 | Child Process     |
| --------- | ------------------------------ | ----------------- |
| Xotira    | Umumiy (SharedArrayBuffer)     | Alohida           |
| Tezlik    | Tez (xotira ko'chirish kam)    | O'rtacha          |
| Xatolar   | Main thread ta'sirlanadi       | Izolyatsiyalangan |
| Muloqot   | MessagePort, SharedArrayBuffer | IPC (pipe)        |

---

## 📁 Fayl tuzilmasi

```
worker-threads/
├── creating-worker/
│   ├── main.js              — Oddiy worker yaratish misoli
│   └── worker.js            — Workerning asosiy kodi
├── message-passing/
│   ├── main.js              — Worker ga xabar yuborish
│   └── worker.js            — Xabar qabul qilish va javob qaytarish
├── message-channel/
│   ├── main.js              — MessageChannel orqali muloqot
│   └── worker.js            — Port orqali xabar almashish
├── between-threads/
│   ├── main.js              — 2 worker o'rtasida to'g'ridan-to'g'ri kanal
│   └── worker.js            — Ikki worker bir-biri bilan gaplashadi
├── main-vs-two-workers/
│   ├── main.js              — Alohida MessageChannel har worker uchun
│   └── worker.js            — Individual port orqali ishlaydi
└── node-syntactic-sugar/
    ├── main.js              — Zamonaviy sintaksis bilan worker yaratish
    └── worker.js            — workerData orqali dastlabki ma'lumot olish
```

---

## 🚀 Ishga tushirish

### Oddiy worker yaratish

```bash
cd creating-worker
node main.js
# Worker ishga tushadi va tugaydi
```

### Xabar yuborish va qabul qilish

```bash
cd message-passing
node main.js
# main → worker xabar yuboradi, worker javob qaytaradi
```

### MessageChannel — ikki tomon muloqoti

```bash
cd message-channel
node main.js
# port1 va port2 orqali ikki yo'nalishli muloqot
```

### Worker'dan Worker'ga muloqot

```bash
cd between-threads
node main.js
# 2 ta worker bir-biri bilan main thread orqali emas, bevosita gaplashadi
```

### zamonaviy sintaksis

```bash
cd node-syntactic-sugar
node main.js
# workerData bilan dastlabki ma'lumot yuborish
```

---

## 🔍 Asosiy tushunchalar

### `parentPort` — main bilan muloqot

```js
// worker.js
const { parentPort, workerData } = require("worker_threads");

parentPort.on("message", (msg) => {
  const result = heavyCalc(msg);
  parentPort.postMessage(result);
});
```

### `MessageChannel` — thread'lar o'rtasida

```js
// main.js
const { MessageChannel } = require("worker_threads");
const { port1, port2 } = new MessageChannel();

// port2 ni worker ga yuborish (workerData orqali)
// port1 orqali javob olish
```

---

## 📚 Bog'liq maqolalar

- [Nodejsda Worker threads (Concurrency va Parallelism)](https://habibovulugbek.medium.com/nodejsda-worker-threads-concurrency-va-parallelism-6ff1c383e381)
- [Nodejs single threadmi yoki multi thread?](https://habibovulugbek.medium.com/nodejs-single-threadmi-yoki-multi-thread-062e129159b7)
- [Thread pool nima?](https://habibovulugbek.medium.com/thread-pool-nima-3bf306583840)
