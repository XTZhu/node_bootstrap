const superagent = require("superagent");
const fs = require("fs");
const path = require("path");
const api = "https://movie.douban.com/j/search_subjects";

function requestDouban(pageStart) {
  return new Promise((resolve, reject) => {
    superagent
      .get(api)
      .query({
        pageStart,
        type: "tv",
        tag: "日本动画",
        sort: "recommend",
        page_limit: 20,
      })
      .type("form")
      .accept("application/json")
      .end((err, res) => {
        if (err) reject(err);

        // console.log("[spider response]:", res.text);
        fs.writeFile(path.resolve(`src/japan_douban/output/${pageStart}.json`), res.text, err => {
          if (err) {
            console.error(err);
            return;
          }
          //文件写入成功。
          console.log("文件写入成功。");
        });

        resolve(res);
      });
  });
}

module.exports = requestDouban;
