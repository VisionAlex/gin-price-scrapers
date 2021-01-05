const logger = require("../log/logger");
const cheerio = require("cheerio");
const axios = require("axios");
const storeSchema = require("../models/mainSchema");
const conn = require("../db");

const alcooldiscountGin = conn.model("alcooldiscountGin", storeSchema);
const data = require("./alcooldiscount.json");

updateAlcooldiscount = async function () {
  try {
    const count = await alcooldiscountGin.countDocuments();
    if (count === 0) {
      console.log("Populating database with alcooldiscount gins");
      for (let item of data) {
        await saveToDb(item);
      }
      logger.log("info", `${data.length} new items added to database`);
    } else {
      console.log("Updating alcoholdiscount gins...");
      let foundUpdates = false;
      for (let item of data) {
        const dbGin = await alcooldiscountGin.findOne({ name: item.name });
        if (!dbGin) saveToDb(item);
        else {
          if (dbGin.price && dbGin.price !== item.price) {
            dbGin.history.unshift({ date: Date.now(), price: item.price });
            await dbGin.save();
            foundUpdates = true;
            logger.log("info", `${dbGin.name} updated price`);
          }
        }
      }
      if (!foundUpdates)
        logger.log("info", "AlcoholDiscount.No updates found.");
    }
  } catch (err) {
    console.log(error);
  }
};

async function saveToDb(item) {
  try {
    const gin = new alcooldiscountGin({
      name: item.name,
      litrage: item.litrage,
      alcohol: item.alcohol,
      history: [{ date: Date.now(), price: item.price }],
    });
    await gin.save();
    console.log(`${gin.name} added to db`);
  } catch (error) {
    console.log(error);
  }
}

module.exports.updateAlcooldiscount = updateAlcooldiscount;
module.exports.alcooldiscountGin = alcooldiscountGin;
