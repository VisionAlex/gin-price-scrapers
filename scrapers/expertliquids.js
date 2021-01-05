const logger = require("../log/logger");
const cheerio = require("cheerio");
const axios = require("axios");
const conn = require("../db");
const storeSchema = require("../models/mainSchema");

const expertliquidsGin = conn.model("expertliquidsGin", storeSchema);

async function updateExpertliquids() {
  try {
    const count = await expertliquidsGin.countDocuments();
    const data = await getData();
    if (count === 0) {
      console.log("Populating database with expertliquids gins...");
      for (let item of data) {
        await saveToDb(item);
      }
      logger.log("info", `${data.length} new items added to database`);
    } else {
      console.log("Updating expertliquids gins...");
      let foundUpdates = false;
      for (let item of data) {
        const dbGin = await expertliquidsGin.findOne({ name: item.name });
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
      if (!foundUpdates) logger.log("info", "Expertliquids.No updates found.");
    }
  } catch (error) {
    console.error(error);
  }
}

async function saveToDb(item) {
  const gin = new expertliquidsGin({
    name: item.name,
    litrage: "",
    alcohol: "",
    history: [{ date: Date.now(), price: item.price }],
  });
  await gin.save();
  console.log(`${gin.name} added to db`);
}

async function getData() {
  let data = [];
  try {
    const response = await axios.get(
      "https://expertliquids.ro/gin-si-vodka/gin"
    );
    const $ = cheerio.load(response.data);
    $(".product-thumb>div.caption").each((index, element) => {
      const name = $(element).find(".name>a").text().toUpperCase();
      let price = $(element)
        .find(".price-new")
        .text()
        .replace(",", ".")
        .replace("RON", "");
      if (!price)
        price = $(element)
          .find(".price-normal")
          .text()
          .replace(",", ".")
          .replace("RON", "");
      data.push({ name, price: parseFloat(price) });
    });
  } catch (error) {
    logger.error(error);
  }
  return data;
}

module.exports.updateExpertliquids = updateExpertliquids;
module.exports.expertliquidsGin = expertliquidsGin;
