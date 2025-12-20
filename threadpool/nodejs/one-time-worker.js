const { Worker } = require("worker_threads");
const path = require("path");
const NUMBERS = require("./inputs");

function runFib(number) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(__dirname, "worker.js"));

    worker.once("message", (result) => {
      resolve(result);
      worker.terminate();
    });

    worker.once("error", reject);

    worker.postMessage({ number });
  });
}

(async () => {
  console.time("one-off-workers");

  const results = await Promise.all(NUMBERS.map((n) => runFib(n)));

  console.timeEnd("one-off-workers");
  //   console.log(results);
})();

module.exports = runFib;
