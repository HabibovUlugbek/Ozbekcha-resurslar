import http from "http";
import { randomUUID } from "crypto";

const jobs = new Map();

function startJob() {
  const jobId = randomUUID();

  const job = {
    status: "pending",
    progress: 0,
  };

  jobs.set(jobId, job);

  let progress = 0;

  const interval = setInterval(() => {
    progress += 10;
    job.status = "running";
    job.progress = progress;

    if (progress >= 100) {
      clearInterval(interval);
      job.status = "completed";
      job.progress = 100;
      job.result = { message: "Job finished successfully" };

      setTimeout(() => jobs.delete(jobId), 5 * 60 * 1000);
    }
  }, 1000);

  return jobId;
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const server = http.createServer((req, res) => {
  setCors(res);

  if (req.method === "POST" && req.url === "/jobs") {
    const jobId = startJob();

    res.writeHead(202, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ jobId }));
  }

  if (req.method === "GET" && req.url.startsWith("/jobs/")) {
    const jobId = req.url.split("/")[2];
    const job = jobs.get(jobId);

    if (!job) {
      res.writeHead(404);
      return res.end("Job not found");
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(job));
  }

  res.writeHead(404);
  res.end();
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
