# Consistent Hashing (Barqaror Xeshlash)

> Distributed tizimlar uchun yukni muvozanatli taqsimlash va node qo'shish/o'chirishda minimal ma'lumot ko'chirilishini ta'minlovchi algoritm.

## 📖 Tushuntirish

**Oddiy (mod N) xeshlashda** muammo: bitta node qo'shilsa yoki o'chirilsa, deyarli **barcha kalitlar** qayta taqsimlanadi.

**Consistent Hashing** — kalitlar va nodelar bitta **doiraviy halqa** (hash ring) ustiga joylashtiriladi. Node o'zgarganda faqat **qo'shni kalitlar** ko'chiriladi.

```
         0°
    ┌────────────┐
    │  Hash Ring │
    │   Node A   │  ← "user:123" → Node A
    │            │
    │   Node B   │  ← "order:456" → Node B
    │            │
    │   Node C   │  ← "item:789" → Node C
    └────────────┘
        360°
```

### Virtual Nodes (Ko'paytmalar)

Har bir real node bir nechta **virtual node** sifatida halqaga qo'shiladi. Bu yukni yanada bir tekis taqsimlaydi.

---

## 📁 Fayl tuzilmasi

```
consistent-hashing/
├── consistent-hashing.js   — ConsistentHashing klassi (virtual nodes bilan)
└── benchmark.js            — 100 node, 1M kalit bilan benchmark va statistika
```

### `consistent-hashing.js` — asosiy API

```js
const ch = new ConsistentHashing(150); // 150 virtual node

ch.addNode("server-1");
ch.addNode("server-2");
ch.addNode("server-3");

ch.getNode("user:12345"); // → "server-2"
ch.removeNode("server-2");
ch.getNode("user:12345"); // → "server-3" (minimal o'zgarish)
```

### `benchmark.js` — nima ko'rsatadi?

- 100 ta node yaratadi, 1,000,000 kalit taqsimlaydi
- Bir nodeni o'chirib, qancha kalit ko'chirilganini hisoblaydi
- Statistika: o'rtacha, minimum, maksimum, standart og'ish

---

## 🚀 Ishga tushirish

```bash
node consistent-hashing.js
# Oddiy qo'shish/o'chirish/qidirish misoli

node benchmark.js
# 1M kalit bilan performance test va taqsimlash statistikasi
```

### Kutilayotgan benchmark natijasi

```
Jami kalitlar: 1,000,000
Bir node o'chirilgandan keyin ko'chirilgan kalitlar: ~10,000 (~1%)
O'rtacha har bir nodeda: 10,000 kalit
```

---

## 🔍 Nima uchun ishlatiladi?

- **Distributed cache** (Redis cluster)
- **Database sharding** — ma'lumotlarni serverlar bo'yicha taqsimlash
- **Load balancing** — so'rovlarni serverlar bo'yicha yo'naltirish
- **CDN** — fayllarni edge serverlarga joylashtirish

---

## 📚 Bog'liq maqolalar

- [Consistent hashing](https://habibovulugbek.medium.com/consistent-hashing-dddfb60a9d20)
- [Consistent hashing 0 dan yozamiz (benchmark bilan)](https://habibovulugbek.medium.com/consistent-hashing-0-dan-yozamiz-benchmark-bilan-91130446cbeb)
