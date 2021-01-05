const mongoose = require("mongoose");
const conn = require("../db");

const aggregateSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  otherNames: [String],
  finestorePrice: Number,
  kingPrice: Number,
  alfadrinkPrice: Number,
  expertliquidsPrice: Number,
  superdrinksPrice: Number,
  alcooldiscountPrice: Number,
  theginisinRating: Number,
  theginisinLink: String,
});

const aggregateGin = conn.model("aggregateGin", aggregateSchema);
module.exports.aggregateGin = aggregateGin;
