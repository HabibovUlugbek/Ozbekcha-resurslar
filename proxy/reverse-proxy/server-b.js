const http = require("http");

const products = [
  { id: 1, name: "Laptop", price: 1200 },
  { id: 2, name: "Mouse", price: 25 },
  { id: 3, name: "Keyboard", price: 80 },
];

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/products") {
    res.writeHead(200);
    return res.end(JSON.stringify(products));
  }

  res.writeHead(404);
  res.end(JSON.stringify({ message: "Route not found on Server B" }));
});

server.listen(3000, () => {
  console.log("Products service running on port 3000");
});
