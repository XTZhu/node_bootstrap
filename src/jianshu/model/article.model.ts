const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  id: {type: Number},
  slug: {type: String},
  title: {type: String},
  abstract: {type: String},
  author: {nickname: {type: String}},
  likeCount: {type: Number},
});


module.exports = mongoose.model('Article', ArticleSchema);