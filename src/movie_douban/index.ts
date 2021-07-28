//引入puppeteer模块
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

//爬取热门电影信息，的网址
const url = "https://movie.douban.com/cinema/nowplaying/beijing/";
//因为要请求信息，这里我们加入async

const main = async () => {
  //1. 打开浏览器
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    // headless: false    //以无头浏览器的形式打开浏览器，没有界面显示，在后台运行的
  });
  //2. 创建tab标签页
  const page = await browser.newPage();
  //3. 跳转到指定网址
  await page.goto(url, {
    waitUntil: "networkidle2", //等待网络空闲时，在跳转加载页面
  });
  //4. 等待网址加载完成，开始爬取数据
  //开启延时器，延时2秒钟在开始爬取数据
  await timeout();

  let result = await page.evaluate(() => {
    //对加载好的页面进行dom操作
    //所有爬取的数据数组
    let result = [];
    //获取所有热门电影的li，这里可以打开开发者选项进行标签的筛选
    const $list = $("#nowplaying>.mod-bd>.lists>.list-item");
    //这里我们只取8条数据
    for (let i = 0; i < 8; i++) {
      const liDom = $list[i];
      //电影标题
      let title = $(liDom).data("title");
      //电影评分
      let rating = $(liDom).data("score");
      //电影片长
      let runtime = $(liDom).data("duration");
      //导演
      let directors = $(liDom).data("director");
      //主演
      let casts = $(liDom).data("actors");
      //豆瓣id
      let doubanId = $(liDom).data("subject");
      //电影的详情页网址
      let href = $(liDom).find(".poster>a").attr("href");
      //电影海报图
      let image = $(liDom).find(".poster>a>img").attr("src");
      //将爬取到的数据加入进该数组中
      result.push({
        title,
        rating,
        runtime,
        directors,
        casts,
        href,
        image,
        doubanId,
      });
    }

    //将爬取的数据返回出去
    return result;
  });

  // console.log(result);

  new Promise((resolve, reject) =>
    fs.writeFile(
      path.resolve(`src/movie_douban/output/nowplaying.txt`),
      JSON.stringify(result),
      err => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        //文件写入成功。
        resolve(1);
        console.log("文件写入成功。");
      }
    )
  ).catch(error => {
    console.log(error);
  });

  return 1;

  //遍历爬取到的8条数据
  for (let i = 0; i < result.length; i++) {
    //获取条目信息
    let item = result[i];
    //获取电影详情页面的网址
    let url = item.href;

    //跳转到电影详情页
    await page.goto(url, {
      waitUntil: "networkidle2", //等待网络空闲时，在跳转加载页面
    });

    //爬取其他数据
    let itemResult = await page.evaluate(() => {
      let genre = [];
      //类型
      const $genre = $('[property="v:genre"]');

      for (let j = 0; j < $genre.length; j++) {
        genre.push($genre[j].innerText);
      }

      //简介
      const summary = $('[property="v:summary"]').html().replace(/\s+/g, "");

      //上映日期
      const releaseDate = $('[property="v:initialReleaseDate"]')[0].innerText;

      //给单个对象添加两个属性
      return {
        genre,
        summary,
        releaseDate,
      };
    });

    // console.log(itemResult);
    //在最后给当前对象添加三个属性`
    //在evaluate函数中没办法读取到服务器中的变量
    item.genre = itemResult.genre;
    item.summary = itemResult.summary;
    item.releaseDate = itemResult.releaseDate;
  }

  new Promise((resolve, reject) =>
    fs.writeFile(
      path.resolve(`src/movie_douban/output/nowplaying_item.txt`),
      { result },
      (err, data) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        //文件写入成功。
        resolve(1);
        console.log("文件写入成功。");
      }
    )
  ).catch(error => {
    console.log(error);
  });

  //5. 关闭浏览器
  await browser.close();

  //最终会将数据全部返回出去
  return result;
};

function timeout() {
  return new Promise(resolve => setTimeout(resolve, 2000));
}
main();

module.exports = main;
