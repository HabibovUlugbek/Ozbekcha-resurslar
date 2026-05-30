# Thread Pool (Iplar Havzasi)

> CPU-intensive vazifalarni Worker Thread'lar havzasi yordamida parallel bajarish va ishlash unumdorligini yaxshilash.

## 📖 Tushuntirish

**Thread Pool** — oldindan yaratilgan worker thread'lar to'plami. Har bir yangi vazifa uchun thread yaratish o'rniga, tayyor thread'lardan foydalaniladi.

```
┌─────────────────────────────────────────┐
│              Thread Pool                 │
│                                         │
│  Vazifalar navbati (Task Queue)         │
│  [fib(100), fib(200), fib(150), ...]    │
│          ↓         ↓         ↓          │
│  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │Worker 1│ │Worker 2│ │Worker 3│      │
│  │(CPU 1) │ │(CPU 2) │ │(CPU 3) │      │
│  └────────┘ └────────┘ └────────┘      │
└─────────────────────────────────────────┘
```

### Nima uchun Thread Pool?

- Har safar yangi thread yaratish — sekin va qimmat
- Thread Pool — tayyor thread'lar navbatga turgan vazifalarni oladi
- CPU yadrolarini to'liq ishlatish imkoni

---

## 📁 Fayl tuzilmasi

```
threadpool/
├── nodejs/
│   ├── pool.js              — ThreadPool klassi (worker queue boshqaruvi)
│   ├── worker.js            — Fibonacci hisoblash (worker ichida)
│   ├── main.js              — Pool yaratish va parallel fibonaccini yuborish
│   ├── single-thread.js     — Taqqoslash: yagona thread'da fibonacci
│   ├── one-time-worker.js   — Har vazifa uchun yangi worker (samarasiz)
│   └── inputs.js            — BigInt fibonacci kirishlari ro'yxati
└── golang/
    └── ...                  — Go tili bilan thread pool implementatsiyasi
```

### `pool.js` — ThreadPool klassi

```js
class ThreadPool {
  constructor(size) {
    this.workers = []; // Worker thread'lar
    this.queue = []; // Kutayotgan vazifalar
    // `size` ta worker yaratadi
  }

  run(task) {
    // Bo'sh worker bo'lsa — darhol yuboradi
    // Aks holda navbatga qo'shadi
  }
}
```

---

## 🚀 Ishga tushirish

### Yagona thread (lent taqqoslash)

```bash
cd nodejs
node single-thread.js
# Barcha fibonacci ketma-ket hisoblanadi — sekin
```

### Har vazifaga yangi worker (samarasiz)

```bash
node one-time-worker.js
# Worker yaratish overhead katta bo'lgani uchun sekin
```

### Thread Pool bilan (optimal)

```bash
node main.js
# Pool barcha CPU yadrolaridan foydalanadi — eng tez
```

### Natijalar taqqoslovi (kutilayotgan)

```
Yagona thread:      ~8,000ms
Har vazifaga worker: ~5,000ms (overhead bor)
Thread Pool:         ~1,200ms ⭐ (CPU*4 ta parallel)
```

---

## 🔍 Thread Pool vs Clustering

| Xususiyat | Thread Pool                | Clustering                 |
| --------- | -------------------------- | -------------------------- |
| Maqsad    | CPU-intensive hisoblash    | HTTP serverni scale qilish |
| Xotira    | Umumiy (SharedArrayBuffer) | Izolyatsiyalangan          |
| Muloqot   | MessagePort                | IPC                        |
| Jarayon   | Bir jarayon                | Alohida jarayonlar         |

---

## 📚 Bog'liq maqolalar

- [Thread pool nima?](https://habibovulugbek.medium.com/thread-pool-nima-3bf306583840)
- [Nodejsda Worker threads (Concurrency va Parallelism)](https://habibovulugbek.medium.com/nodejsda-worker-threads-concurrency-va-parallelism-6ff1c383e381)
- [Nodejs single threadmi yoki multi thread?](https://habibovulugbek.medium.com/nodejs-single-threadmi-yoki-multi-thread-062e129159b7)
