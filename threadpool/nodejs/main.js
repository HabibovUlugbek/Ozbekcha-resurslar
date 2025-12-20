const ThreadPool = require("./pool.js");
const os = require("os");
const NUMBERS = require("./inputs");

const poolSize = os.cpus().length; //CPU-corelar soniga teng workerlar yaratamiz
const pool = new ThreadPool("./worker.js", poolSize);

async function main() {
  try {
    console.log(
      "Fibonacci raqamlarni worker thread pooldan foydalangan holda hisoblash ..."
    );
    console.time("thread-pool");

    const results = await Promise.all(NUMBERS.map((n) => pool.run(n)));

    console.timeEnd("thread-pool");
    // inputs.forEach((n, index) => {
    //   console.log(`fib(${n}) = ${results[index]}`);
    // });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    if (pool.destroy) {
      await pool.destroy();
    }
  }
}

main();
