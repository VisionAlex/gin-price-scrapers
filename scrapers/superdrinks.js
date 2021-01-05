const logger = require("../log/logger");
const cheerio = require("cheerio");
const axios = require("axios");
const _ = require("lodash");
const storeSchema = require("../models/mainSchema");
const conn = require("../db");

const superdrinksGin = conn.model("superdrinksGin", storeSchema);

async function updateSuperdrinks() {
  let count = await superdrinksGin.countDocuments();
  let data = await getData();
  if (count === 0) {
    console.log("Populating database with finestore gins");
    for (let item of data) {
      await saveToDb(item);
    }

    logger.log("info", `${data.length} new items added to database`);
  } else {
    console.log("Updating superdrinks...");
    let foundUpdates = false;
    for (let item of data) {
      const dbGin = await superdrinksGin.findOne({ name: item.name });
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
    if (!foundUpdates) logger.log("info", "Superdrinks.No updates found.");
  }
}

async function saveToDb(item) {
  const gin = new superdrinksGin({
    name: item.name,
    litrage: item.litrage,
    alcohol: item.alcohol,
    history: [{ date: Date.now(), price: item.price }],
  });
  await gin.save();
  console.log(`${gin.name} added to db`);
}
async function getData() {
  let data = [];
  const url = "https://specialdrinks.ro/gin-14?page=";
  const pageNumber = await getPageNumber();
  for (let i = 1; i <= pageNumber; i++) {
    let pageUrl = url + i;
    const response = await axios.get(pageUrl);
    for (let item of response.data.products) {
      const text = item.name.match(
        /(^.*)\s(\d{1}\.{0,1}\d*L).*\/\s(\d*\.{0,1}\d*\%)/
      );
      if (text) {
        const name = text[1] + " " + text[2];
        const litrage = text[2];
        const alcohol = text[3];
        const price = item.price_amount;
        const gin = {
          name,
          litrage,
          alcohol,
          price,
        };
        data.push(gin);
        // console.log(`${name}`);
      } else continue;
    }
  }
  sortedData = _.orderBy(data, "name");
  return sortedData;
}

async function getPageNumber() {
  try {
    const response = await axios.get("https://specialdrinks.ro/gin-14");
    const $ = await cheerio.load(response.data);
    return response.data.pagination.pages_count;
  } catch (error) {
    logger.error(error);
  }
}

module.exports.updateSuperdrinks = updateSuperdrinks;
module.exports.superdrinksGin = superdrinksGin;
