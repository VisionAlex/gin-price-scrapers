const mongoose = require("mongoose");
const mongoURI = "mongodb://localhost:27017/gin-club";
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

module.exports = conn;
