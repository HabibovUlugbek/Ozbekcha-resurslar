const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
  const interval = setInterval(() => {
    ws.send(
      JSON.stringify({
        message: "push from server",
        time: new Date().toISOString(),
      })
    );
  }, 2000);

  ws.on("close", () => clearInterval(interval));
});
console.log("WebSocket server is running on ws://localhost:8080");
