import http from "http";
import { initPublisher, publish } from "./publisher.js";

await initPublisher();

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // START JOB
  if (req.method === "POST" && req.url === "/start") {
    const jobId = `job:${Date.now()}`;
    publish("job-start", { jobId });

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ jobId }));
  }

  // CANCEL JOB
  if (req.method === "POST" && req.url.startsWith("/cancel")) {
    const url = new URL(req.url, "http://localhost");
    const jobId = url.searchParams.get("jobId");

    publish("job-cancel", { jobId });

    res.writeHead(200);
    return res.end("Canceled");
  }

  res.writeHead(404);
  res.end();
});

server.listen(8081, () =>
  console.log("API Gateway running on http://localhost:8081")
);
