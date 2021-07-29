const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const superagent = require('superagent');
const Article = require('./model/article.model.ts')
const initMongo = require('./connect_mongo.ts');

const reptileUrl = 'https://www.jianshu.com/';

initMongo();

superagent.get(reptileUrl).end((err, res) => {
  if (err) {
    console.log(err);
    return;
  }

  let $ = cheerio.load(res.text);

  let data = [];
  $('#list-container .note-list li').each((i, elem) => {
    let __this = $(elem);
    console.log(i);
    console.log(elem);
    data.push({
      id: __this.attr('data-note-id'),
      slug: __this.find('.title').attr('href').replace(/\/p\//, ""),
      title: replaceText(__this.find('.title').text()),
      abstract: replaceText(__this.find('.abstract').text()),
      thumbnails: __this.find('.wrap-img img').attr('src'),
      author: {
        nickname: __this.find('.nickname').text(),
      },
      likeCount: parseInt(replaceText(__this.find('.ic-list-like').parent().text()), 10),
    });


  })

  Article.insertMany(data).then(res => {
    console.log('info write success' + res);
  }).catch(error => {
    console.error(error);
  })

  fs.writeFile(path.resolve('src/jianshu/output/output.json'), JSON.stringify({
    status: 0,
    data: data
  }), (error) => {
    if (error) {
      throw error;
    }
    console.log('写入完成');
  })

//  预计需要的data
//   {
//     id：  每条文章id
//     slug：每条文章访问的id （加密的id）
//     title： 标题
//     abstract： 描述
//     thumbnails： 缩略图 （如果文章有图，就会抓第一张，如果没有图就没有这个字段）
//     collection_tag：文集分类标签
//     reads_count： 阅读计数
//     comments_count： 评论计数
//     likes_count：喜欢计数
//     author： {
//     // 作者信息
//       id：没有找到
//       slug： 每个用户访问的id （加密的id）
//       avatar：会员头像
//       nickname：会员昵称（注册填的那个）
//       sharedTime：发布日期
//     }
//   }
})


function replaceText(text) {
  return text.toString().replace(/\n/g, '').replace(/\s/g, '');
}
