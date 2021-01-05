const logger = require("../log/logger");
const cheerio = require("cheerio");
const axios = require("axios");
const storeSchema = require("../models/mainSchema");
const conn = require("../db");

const finestoreGin = conn.model("finestoreGin", storeSchema);

updateFinestore = async function () {
  try {
    const count = await finestoreGin.countDocuments();
    const data = await getData();
    if (count === 0) {
      console.log("Populating database with finestore gins...");
      for (let item of data) {
        await saveToDb(item);
      }

      logger.log("info", `${data.length} new items added to database`);
    } else {
      console.log("Updating finestore gins...");
      let foundUpdates = false;
      for (let item of data) {
        const dbGin = await finestoreGin.findOne({ name: item.name });
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
      if (!foundUpdates) logger.log("info", "Finestore.No updates found.");
    }
  } catch (error) {
    logger.error(error);
  }
};

async function saveToDb(item) {
  const gin = new finestoreGin({
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
  let finestoreUrl = "https://www.finestore.ro/gin?&page=";
  const pageNumber = await getPageNumber();
  for (let i = 1; i <= pageNumber; i++) {
    try {
      const response = await axios.get(finestoreUrl + i);
      const $ = cheerio.load(response.data);

      $(".product-thumb").each(async (index, element) => {
        const name = $(element).find("h4").text().toUpperCase();
        const price = $(element)
          .find(".price")
          .children()
          .first()
          .text()
          .replace(",", ".")
          .replace(" Lei", "");
        const details = $(element)
          .find(".litraj_alcool")
          .text()
          .trim()
          .split("/");
        let litrage;
        let match = details[0].trim().match(/(^\d+).*/);
        match
          ? (litrage = parseInt(match[1]) / 100 + "L")
          : (litrage = details[0].trim());
        const gin = {
          name,
          litrage: litrage,
          alcohol: details[1].trim(),
          price: parseFloat(price),
        };
        data.push(gin);
      });
    } catch (ex) {
      logger.log("warning", ex);
    }
  }
  return data;
}

async function getPageNumber() {
  try {
    const response = await axios.get("https://www.finestore.ro/gin");
    const $ = cheerio.load(response.data);
    const text = $(".results").text();
    const pageNumber = text.match(/(\d+)\sPagini/)[1];
    return parseInt(pageNumber);
  } catch (error) {
    logger.error(error);
  }
}

module.exports.updateFinestore = updateFinestore;
module.exports.finestoreGin = finestoreGin;
