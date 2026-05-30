# Process Communication (Jarayonlar Orasidagi Muloqot)

> Operatsion tizimda jarayonlar o'rtasida ma'lumot almashishning turli usullari: standart oqimlar, Unix domain socket'lari va IPC mexanizmlari.

## 📖 Tushuntirish

Operatsion tizimda har bir **jarayon (process)** o'zining izolyatsiyalangan xotira maydonida ishlaydi. Jarayonlar o'rtasida ma'lumot almashish uchun **IPC (Inter-Process Communication)** mexanizmlari ishlatiladi.

### IPC usullari

| Usul                    | Tavsif                                      |
| ----------------------- | ------------------------------------------- |
| **Stdin/Stdout/Stderr** | Standart oqimlar — eng oddiy usul           |
| **Unix Domain Socket**  | Lokal mashina ichida tezkor socket muloqoti |
| **Shared Memory**       | Umumiy xotira maydoni                       |
| **Message Queue**       | Xabar navbati                               |
| **Pipe**                | Bir jarayondan boshqasiga oqim              |

---

## 📁 Fayl tuzilmasi

```
process-communication/
├── input-ouput-streams.js     — stdin, stdout, stderr oqimlarini ko'rsatadi
└── unix-domain-sockets/
    ├── server.cpp             — C++ Unix domain socket serveri
    └── client.js              — Node.js Unix domain socket klienti
```

### `input-ouput-streams.js` — standart oqimlar

```js
// stdin — foydalanuvchi kiritishi
process.stdin.on("data", (data) => {
  process.stdout.write(`Qabul qilindi: ${data}`);
});

// stderr — xato xabarlari
process.stderr.write("Xato yuz berdi!\n");
```

### `unix-domain-sockets/` — C++ server + Node.js klient

Bu misol **interoperability** (turli tillar o'rtasida muloqot) ni ko'rsatadi:

- `server.cpp` — C++ da yozilgan Unix domain socket serveri
- `client.js` — Node.js da yozilgan klient unga ulanadi

---

## 🚀 Ishga tushirish

### Standart oqimlar

```bash
node input-ouput-streams.js
# Terminal stdin dan o'qiydi va stdout ga yozadi
```

### Unix Domain Socket (C++ server + Node.js klient)

```bash
cd unix-domain-sockets

# 1. C++ serverni kompilatsiya qilish
g++ -o server server.cpp

# 2. Serverni ishga tushirish
./server &

# 3. Node.js klientni ishga tushirish
node client.js
```

> **Eslatma:** Unix domain socket'lari faqat bir xil mashinada ishlaydi. TCP socket'lariga qaraganda tezroq, chunki tarmoq stekidan o'tmaydi.

---

## 🔍 Unix Socket vs TCP Socket

| Xususiyat       | Unix Domain Socket | TCP Socket       |
| --------------- | ------------------ | ---------------- |
| Joylashuv       | Bir xil mashina    | Tarmoq orqali    |
| Tezlik          | Juda tez           | O'rtacha         |
| Identifikatsiya | Fayl yo'li         | IP:port          |
| Xavfsizlik      | Fayl huquqlari     | Tarmoq firewalli |

---

## 📚 Bog'liq maqolalar

- [Processlar orasidagi kommunikatsiya (IPC)](https://habibovulugbek.medium.com/processlar-orasidagi-kommunikatsiya-ipc-6e1d95acba16)
- [Processlar va thread nima farqi bor?](https://habibovulugbek.medium.com/process-va-thread-nima-farqi-bor-78201ce6a72f)
- [Unix qanday ishlaydi?](https://habibovulugbek.medium.com/unix-qanday-ishlaydi-36bf80a69fef)
