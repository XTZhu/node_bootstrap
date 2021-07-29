const mongoose  = require('mongoose');

function initMongo() {
  mongoose.connect('mongodb://localhost:27017/jianshu', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  const db = mongoose.connection;

  db.on('error', console.error.bind(console, 'connection error:'));

  db.once('open', () => {
    console.log(' we"re connected!');
  })
}

module.exports = initMongo;