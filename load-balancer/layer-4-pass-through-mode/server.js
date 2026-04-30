const http = require("http");
const port = process.env.PORT || 3000;
// SERVER_ID serverlarni ajratib olish uchun ishlatamiz
const serverId = process.env.SERVER_ID || "Server";

const server = http.createServer((req, res) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`Request received on ${serverId}: client IP = ${clientIP}`);
  res.end(`Hello from ${serverId}!\n`);
});

server.listen(port, () => {
  console.log(`${serverId} listening on port ${port}`);
});
