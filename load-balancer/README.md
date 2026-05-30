# Load Balancer (Yuk Muvozanatlash)

> Kiruvchi tarmoq so'rovlarini bir nechta server o'rtasida taqsimlash orqali yuqori mavjudlik va ishlash unumdorligini ta'minlash. HAProxy yordamida Layer 4 va Layer 7 load balancing misollari.

## 📖 Tushuntirish

**Load Balancer** — bitta kirish nuqtasi bo'lib, so'rovlarni backend serverlarga yo'naltiradi.

```
Klientlar ──▶ [ Load Balancer ] ──▶ Server 1
                                ──▶ Server 2
                                ──▶ Server 3
```

### Layer 4 vs Layer 7

| Xususiyat       | Layer 4 (TCP)   | Layer 7 (HTTP)      |
| --------------- | --------------- | ------------------- |
| Ko'radi         | IP, port        | URL, header, cookie |
| Tezlik          | Juda tez        | O'rtacha            |
| Yo'naltirish    | IP/port asosida | Kontent asosida     |
| SSL termination | ❌              | ✅                  |

### Algoritmlari

| Algoritm                | Tavsif                   |
| ----------------------- | ------------------------ |
| **Round Robin**         | Tartibda navbat bilan    |
| **Least Connection**    | Eng kam ulanishi borga   |
| **Least Response Time** | Eng tez javob beruvchiga |

---

## 📁 Fayl tuzilmasi

```
load-balancer/
├── test-load-balancer.js              — 1000 so'rov yuborib, taqsimlashni tekshiradi
├── layer-4-pass-through-mode/
│   ├── server.js                      — Backend server (server ID qaytaradi)
│   ├── Dockerfile
│   ├── docker-compose.yml             — HAProxy + 3 backend (TPROXY, round-robin)
│   └── haproxy.cfg                    — TCP load balancing konfiguratsiyasi
├── layer-4-proxy-mode/
│   ├── server.js
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── haproxy.cfg
├── layer-7-least-connection/
│   ├── server.js
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── haproxy.cfg
└── layer-7-least-response-time/
    ├── server.js                      — Tasodifiy kechikish bilan javob qaytaradi
    ├── Dockerfile
    ├── docker-compose.yml
    └── haproxy.cfg
```

---

## 🚀 Ishga tushirish

### Talablar

- Docker va Docker Compose o'rnatilgan bo'lishi kerak

### Layer 4 — Pass-through mode

```bash
cd layer-4-pass-through-mode
docker compose up --build

# Test
node ../test-load-balancer.js
# Har server nechta so'rov olganini ko'rsatadi
```

### Layer 4 — Proxy mode

```bash
cd layer-4-proxy-mode
docker compose up --build

node ../test-load-balancer.js
```

### Layer 7 — Least Connection

```bash
cd layer-7-least-connection
docker compose up --build

node ../test-load-balancer.js
```

### Layer 7 — Least Response Time

```bash
cd layer-7-least-response-time
docker compose up --build

node ../test-load-balancer.js
# Sekin serverlar kamroq so'rov olishini ko'rasiz
```

### Konteynerlarni to'xtatish

```bash
docker compose down
```

---

## 🔍 HAProxy konfiguratsiya misoli

```cfg
frontend http_front
    bind *:80
    default_backend servers

backend servers
    balance leastconn          # yoki roundrobin, leasttime
    server s1 server1:3000 check
    server s2 server2:3000 check
    server s3 server3:3000 check
```

---

## 📚 Bog'liq maqolalar

- [Load balancer nima uchun kerak?](https://medium.com/@habibovulugbek/load-balancer-nima-uchun-kerak-8b01e476340e)
- [Single point of failure (SPOF)](https://medium.com/@habibovulugbek/single-point-of-failure-spof-291485d18ba0)
- [Fail-over va fault tolerance](https://medium.com/@habibovulugbek/fail-over-va-fault-tolorence-018ce8bbf162)
