# Child Process (Bolalar Jarayonlar)

> Node.js da `child_process` moduli yordamida yangi jarayonlar yaratish va ular bilan muloqot qilish usullarini ko'rsatuvchi misollar.

## 📖 Tushuntirish

Node.js **yagona ipli (single-threaded)** bo'lsa-da, `child_process` moduli orqali tizim darajasida yangi jarayonlar yaratib, ularda parallel ish bajarish mumkin. Bu CPU-intensive vazifalar uchun, yoki tizim buyruqlarini bajarish uchun ishlatiladi.

### To'rt asosiy metod

| Metod        | Tavsif                                              | IPC |
| ------------ | --------------------------------------------------- | --- |
| `exec()`     | Shell buyrug'ini bajaradi, natijani buffer ga oladi | ❌  |
| `spawn()`    | Jarayonni stream orqali boshqaradi                  | ❌  |
| `fork()`     | Node.js skriptini fork qiladi, IPC mavjud           | ✅  |
| `execFile()` | To'g'ridan-to'g'ri fayl bajaradi (shell yo'q)       | ❌  |

---

## 📁 Fayl tuzilmasi

```
child-process/
├── exec.js          — exec() bilan shell buyrug'i bajarish (ls -l)
├── spawn.js         — spawn() bilan 'll' buyrug'ini stream bilan boshqarish
├── fork.js          — fork() bilan child.js ni yaratish va xabar yuborish
├── child.js         — Fork orqali yaratilgan jarayon (IPC xabarlar qabul qiladi)
├── arg.js           — Buyruq qatori argumentlarini qayta ishlash misoli
└── opening-app.js   — spawn() bilan tashqi dasturni (Trello) ochish
```

---

## 🚀 Ishga tushirish

### `exec` — Shell buyrug'ini bajarish

```bash
node exec.js
# ls -l buyrug'i bajariladi va natija konsol'ga chiqariladi
```

### `spawn` — Stream bilan jarayon

```bash
node spawn.js
# 'll' buyrug'i bajariladi, stdout stream orqali olinadi
```

### `fork` — IPC bilan xabar almashish

```bash
node fork.js
# parent.js child.js ni fork qiladi, IPC orqali xabar yuboradi va qabul qiladi
```

### `arg` — Argumentlar bilan jarayon

```bash
node arg.js hello world
# process.argv orqali argumentlar konsolga chiqariladi
```

---

## 🔍 fork() va spawn() farqi

```js
// spawn — tashqi buyruq, IPC yo'q
const ls = spawn("ls", ["-l"]);
ls.stdout.on("data", (data) => console.log(data.toString()));

// fork — Node.js fayli, IPC mavjud
const child = fork("./child.js");
child.send({ msg: "salom" });
child.on("message", (msg) => console.log(msg));
```

---

## 📚 Bog'liq maqolalar

- [Nodejsda Child process](https://habibovulugbek.medium.com/nodejsda-child-process-aa8312dcc228)
- [Processlar va thread nima farqi bor?](https://habibovulugbek.medium.com/process-va-thread-nima-farqi-bor-78201ce6a72f)
