const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  litrage: String,
  alcohol: String,
  history: { type: [{ date: Date, price: Number }], default: [] },
});

storeSchema.virtual("price").get(function () {
  return this.history[0].price;
});

module.exports = storeSchema;
