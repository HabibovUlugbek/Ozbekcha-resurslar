const { Worker } = require("worker_threads");
const path = require("path");

class ThreadPool {
  constructor(workerFile, poolSize = 4) {
    this.workerFile = workerFile;
    this.poolSize = poolSize;

    this.workers = [];
    this.idleWorkers = [];
    this.taskQueue = [];
    this.taskId = 0;
    this.callbacks = new Map();

    this._init();
  }

  _init() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(this.workerFile);

      worker.on("message", ({ taskId, result }) => {
        const callback = this.callbacks.get(taskId);
        if (callback) {
          callback(result);
          this.callbacks.delete(taskId);
        }

        this.idleWorkers.push(worker);
        this._runNextTask();
      });

      worker.on("error", (err) => {
        console.error("Worker error:", err);
      });

      this.workers.push(worker);
      this.idleWorkers.push(worker);
    }
  }

  _runNextTask() {
    if (this.taskQueue.length === 0) return;
    if (this.idleWorkers.length === 0) return;

    const worker = this.idleWorkers.pop();
    const task = this.taskQueue.shift();

    worker.postMessage(task);
  }

  run(number) {
    return new Promise((resolve) => {
      const taskId = ++this.taskId;

      this.callbacks.set(taskId, resolve);
      this.taskQueue.push({ taskId, number });

      this._runNextTask();
    });
  }

  async destroy() {
    await Promise.all(this.workers.map((w) => w.terminate()));
  }
}

module.exports = ThreadPool;
