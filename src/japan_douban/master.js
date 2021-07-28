const cluster = require("cluster");
let cpuNums = require("os").cpus().length;

// const requestDouban = require('./requestDouban')

cluster.setupMaster({
  exec: "./src/japan_douban/worker.js",
  args: ["--use", "https"],
});

console.log(`总共拥有 ${cpuNums} 个子进程`);

cpuNums = cpuNums >= 4 ? 4 : cpuNums;
console.log(`实际使用 ${cpuNums} 个子进程`);

let pageNum = 10;
const startTime = Date.now();

for (let i = 0; i < cpuNums; i++) {
  const work = cluster.fork();
  work.send([i, cpuNums, pageNum]);
  work.on("message", msg => {
    console.log(msg);
    pageNum--;

    if (pageNum === 0) {
      console.log(`已完成爬取，耗时 ${Date.now() - startTime}ms`);
      console.log("关闭当前子进程");
      cluster.disconnect();
    }
  });
}


cluster.on("fork", worker => {
  console.log(`[master]: fork worker ${worker.id}`);
});

cluster.on("exit", worker => {
  console.log(`[master]:  子进程 ${worker.id} 被关闭`);
});
