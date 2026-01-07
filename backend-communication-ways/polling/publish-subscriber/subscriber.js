import amqp from "amqplib";
import { publish, initPublisher } from "./publisher.js";

const EXCHANGE = "jobs";
const jobs = {}; // jobId -> status

await initPublisher();

const conn = await amqp.connect("amqp://localhost");
const ch = await conn.createChannel();

await ch.assertExchange(EXCHANGE, "fanout", { durable: false });

const q = await ch.assertQueue("", { exclusive: true });
await ch.bindQueue(q.queue, EXCHANGE, "");

console.log("Worker listening for jobs...");

ch.consume(
  q.queue,
  (msg) => {
    const { event, payload } = JSON.parse(msg.content.toString());

    if (event === "job-start") startJob(payload.jobId);
    if (event === "job-cancel") cancelJob(payload.jobId);
  },
  { noAck: true }
);

function startJob(jobId) {
  if (jobs[jobId]) return;

  jobs[jobId] = { running: true, progress: 0 };
  run(jobId);
}

function cancelJob(jobId) {
  if (!jobs[jobId]) return;
  jobs[jobId].running = false;

  publish("job-canceled", { jobId });
}

function run(jobId) {
  const job = jobs[jobId];
  if (!job || !job.running) return;

  job.progress++;

  publish("job-update", {
    jobId,
    progress: job.progress,
  });

  setTimeout(() => run(jobId), 1000);
}
