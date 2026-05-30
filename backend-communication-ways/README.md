# Backend Kommunikatsiya Usullari

> Backend tizimlar o'rtasida ma'lumot almashishning turli usullarini amalda ko'rsatuvchi misollar to'plami.

![Backend Communication Diagram](../diagrams/backend-communication/backend-communication.png)

## 📖 Tushuntirish

Klient va server o'rtasida ma'lumot almashishning bir nechta usullari mavjud. Har bir usulning o'ziga xos afzalliklari va kamchiliklari bor. Bu papkada quyidagi 5 ta usul amalda ko'rsatilgan:

| Usul                         | Tavsif                                                          |
| ---------------------------- | --------------------------------------------------------------- |
| **Short Polling**            | Klient ma'lum vaqt oralig'ida serverdan yangi ma'lumot so'raydi |
| **Long Polling**             | Klient server javob bergunga qadar kutadi                       |
| **Publish/Subscribe**        | RabbitMQ orqali hodisalar asosida xabar almashish               |
| **Push (WebSocket)**         | Server o'zi klientga ma'lumot itaradi                           |
| **Server-Sent Events (SSE)** | Server klientga bir tomonlama uzluksiz ma'lumot yuboradi        |

---

## 📁 Papka tuzilmasi

```
backend-communication-ways/
├── polling/
│   ├── short-polling/
│   │   ├── server.js       — HTTP server (ishni bajaradi, 202 qaytaradi)
│   │   └── client.html     — Har 1.5 soniyada so'rov yuboradigan klient
│   └── long-polling/
│       ├── server.js       — Javob 30 soniyaga qadar kutadi
│       └── client.html     — Javob kelguncha kutuvchi klient
├── publish-subscriber/
│   ├── server.js           — API Gateway (AMQP exchange ga publish qiladi)
│   ├── publisher.js        — RabbitMQ ga ulanadi va event yuboradi
│   ├── subscriber.js       — Ishni qabul qiluvchi worker
│   ├── client.html         — EventSource orqali yangilanishlarni ko'rsatadi
│   ├── docker-command.md   — RabbitMQ ni Docker bilan ishga tushirish
│   └── package.json
├── push/
│   ├── server.js           — WebSocket server (har 2 soniyada ma'lumot yuboradi)
│   ├── client.html         — WebSocket klient
│   └── package.json
└── server-sent-event/
    ├── server.js           — SSE server (job hodisalarini broadcast qiladi)
    └── client.html         — EventSource orqali tinglaydi
```

---

## 🚀 Ishga tushirish

### 1. Short Polling

```bash
cd polling/short-polling
node server.js
# Keyin brauzerde client.html ni oching
```

### 2. Long Polling

```bash
cd polling/long-polling
node server.js
# Keyin brauzerde client.html ni oching
```

### 3. Publish/Subscribe (RabbitMQ kerak)

```bash
# Avval RabbitMQ ni ishga tushiring
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management

cd publish-subscriber
npm install

# Har birini alohida terminallarda ishga tushiring:
node publisher.js
node subscriber.js
node server.js
# Keyin client.html ni brauzerde oching
```

### 4. Push (WebSocket)

```bash
cd push
npm install
node server.js
# Keyin client.html ni brauzerde oching
```

### 5. Server-Sent Events

```bash
cd server-sent-event
node server.js
# Keyin client.html ni brauzerde oching
```

---

## 🔍 Usullarni solishtirish

| Xususiyat   | Short Polling | Long Polling  | Pub/Sub        | WebSocket      | SSE           |
| ----------- | ------------- | ------------- | -------------- | -------------- | ------------- |
| Yo'nalish   | Bir tomonlama | Bir tomonlama | Ikki tomonlama | Ikki tomonlama | Bir tomonlama |
| Server yuki | Yuqori        | O'rtacha      | Past           | Past           | Past          |
| Murakkablik | Oddiy         | O'rtacha      | Murakkab       | O'rtacha       | Oddiy         |
| Real-time   | ❌            | ✅            | ✅             | ✅             | ✅            |

---

## 📚 Bog'liq maqolalar

- [Backend kommunikatsiya usullari (1-qism)](https://medium.com/@habibovulugbek/backend-kommunikatsiya-usullari-1-qism-51fb43a4200b)
- [Backend kommunikatsiya usullari (2-qism)](https://medium.com/@habibovulugbek/backend-kommunikatsiya-usullari-2-qism-71982050a9e3)
