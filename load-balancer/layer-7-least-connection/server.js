const http = require("http");
const port = process.env.PORT || 3000;
const serverId = process.env.SERVER_ID || "Server";
// Optional: MAX_DELAY env o'zgaruvchisi orqali javob kechikishini boshqarish
const MAX_DELAY = process.env.MAX_DELAY
  ? parseInt(process.env.MAX_DELAY, 10)
  : 1000; // default 1000ms

const server = http.createServer((req, res) => {
  const delay = MAX_DELAY ? Math.floor(Math.random() * MAX_DELAY) : 0;

  setTimeout(() => {
    res.end(`Hello from ${serverId}! (response delayed ${delay}ms)\n`);
  }, delay);
});

server.listen(port, () => {
  console.log(`${serverId} listening on port ${port}`);
});
