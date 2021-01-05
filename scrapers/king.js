const logger = require("../log/logger");
const cheerio = require("cheerio");
const axios = require("axios");
const storeSchema = require("../models/mainSchema");
const conn = require("../db");

const kingGin = conn.model("kingGin", storeSchema);

async function getPageNumber() {
  try {
    const response = await axios.get("https://king.ro/gin/");
    const $ = await cheerio.load(response.data);
    const text = $("div.ty-pagination").find("span").text();
    const pageNumber = text.match(/\d{1}$/, text)[0];
    return pageNumber;
  } catch (error) {
    logger.error(error);
  }
}

async function getData() {
  let data = [];
  let kingUrl = "https://king.ro/gin/page-";
  const pageNumber = await getPageNumber();
  for (let i = 1; i <= pageNumber; i++) {
    try {
      const response = await axios.get(kingUrl + i);
      const $ = cheerio.load(response.data);

      $("div.infot").each((index, element) => {
        const part1 = $(element).find("a>span").text().toUpperCase();
        const part2 = $(element).find("bdi").first().text().toUpperCase();
        const litrage = $(element)
          .find("div.ty-product-list__feature")
          .text()
          .replace("Sticla -  ", "")
          .replace(" ", "");
        let name = part1 + " " + part2 + " " + litrage;
        name = name.replace(/\d{2}(\.\d){0,1}%/, "");
        const price = $(element)
          .find("span.ty-price-num")
          .html()
          .replace("<sup>", ".")
          .replace("</sup>", "");
        data.push({
          name,
          price: parseFloat(price),
          litrage,
          alcohol: "",
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
  return data;
}

async function updateKing() {
  try {
    const data = await getData();
    const count = await kingGin.countDocuments();
    if (count === 0) {
      console.log("Populating database with king gins...");
      for (let item of data) {
        await saveToDb(item);
      }

      logger.log("info", `${data.length} new items added to database`);
    } else {
      console.log("Updating king gins...");
      let foundUpdates = false;
      for (let item of data) {
        const dbGin = await kingGin.findOne({ name: item.name });
        if (!dbGin) saveToDb(item);
        else {
          if (dbGin.price && dbGin.price !== item.price) {
            dbGin.history.unshift({ date: Date.now(), price: item.price });
            await dbGin.save();
            foundUpdates = true;
          }
        }
      }
      if (!foundUpdates) logger.log("info", "King. No updates found");
    }
  } catch (error) {
    console.log(error);
  }
}

async function saveToDb(item) {
  const gin = new kingGin({
    name: item.name,
    litrage: item.litrage,
    alcohol: item.alcohol,
    history: [{ date: Date.now(), price: item.price }],
  });
  await gin.save();
  console.log(`${gin.name} added to db`);
}

// updateKing();

module.exports.kingGin = kingGin;
module.exports.updateKing = updateKing;
