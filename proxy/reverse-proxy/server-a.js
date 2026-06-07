const http = require("http");

const users = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Alice Smith" },
  { id: 3, name: "Bob Johnson" },
];

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/users") {
    res.writeHead(200);
    return res.end(JSON.stringify(users));
  }

  res.writeHead(404);
  res.end(JSON.stringify({ message: "Route not found on Server A" }));
});

server.listen(3000, () => {
  console.log("Users service running on port 3000");
});
