# File Commander (Fayl Boshqaruvchi)

> Node.js dagi `fs` moduli yordamida matn faylida yozilgan buyruqlar asosida fayl operatsiyalarini avtomatik bajaruvchi dastur.

## 📖 Tushuntirish

**File Commander** — `command.txt` faylidagi buyruqlarni o'qib, fayl tizimida tegishli amallarni bajaradi. Bu Node.js dagi `fs` moduli, fayl kuzatuvi (`fs.watch`) va buyruqlarni parse qilishning amaliy misoli.

Dastur `command.txt` faylini kuzatadi. Fayl o'zgarganda, undagi buyruqlarni o'qib bajaradi.

## 📁 Fayl tuzilmasi

```
file-commander/
├── app.js        — Asosiy dastur (command.txt ni kuzatadi va bajaradi)
└── command.txt   — Buyruqlar yoziladigan fayl
```

## 🚀 Ishga tushirish

1. `command.txt` faylini buyruqlar bilan to'ldiring. Buyruqlar `;` bilan ajratiladi:

   ```
   CREATE FILE yangi.txt;RENAME FILE eski.txt TO yangi2.txt;DELETE FILE eski.txt
   ```

2. Dasturni ishga tushiring:

   ```bash
   node app.js
   ```

3. Dastur `command.txt` dagi buyruqlarni o'qib, fayl operatsiyalarini bajaradi.

## 📋 Buyruqlar sintaksisi

| Buyruq                                  | Tavsif                                         |
| --------------------------------------- | ---------------------------------------------- |
| `CREATE FILE <yo'l>`                    | Yangi fayl yaratadi                            |
| `DELETE FILE <yo'l>`                    | Faylni o'chiradi                               |
| `RENAME FILE <eski> TO <yangi>`         | Faylni qayta nomlaydi                          |
| `INSERT TO FILE <yo'l> content: <matn>` | Faylga matn yozadi (fayl yo'q bo'lsa yaratadi) |

## 💡 Misol

`command.txt` faylida:

```
CREATE FILE salom.txt;INSERT TO FILE salom.txt content: Salom dunyo!;RENAME FILE salom.txt TO xayr.txt
```

`node app.js` ishga tushirilganda:

1. `salom.txt` yaratiladi
2. Ichiga `Salom dunyo!` yoziladi
3. `xayr.txt` ga o'zgartiriladi

## 📚 Bog'liq maqolalar

- [Unix qanday ishlaydi?](https://habibovulugbek.medium.com/unix-qanday-ishlaydi-36bf80a69fef)
- [Terminal haqida boshlang'ich bilimlar](https://habibovulugbek.medium.com/terminal-haqida-boshlang-ich-bilimlar-d0e865478724)

Batafsil `fs` moduli haqida: [Node.js rasmiy hujjatlari](https://nodejs.org/api/fs.html)
