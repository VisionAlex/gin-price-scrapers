const logger = require("../log/logger");
const cheerio = require("cheerio");
const axios = require("axios");
const storeSchema = require("../models/mainSchema");
const conn = require("../db");

const alfadrinkGin = conn.model("alfadrinkGin", storeSchema);

async function updateAlfadrink() {
  try {
    const count = await alfadrinkGin.countDocuments();
    const data = await getData();
    if (count === 0) {
      console.log("Populating database with alfadrink gins...");
      for (let item of data) {
        await saveToDb(item);
      }
      logger.log("info", `${data.length} new items added to database`);
    } else {
      console.log("Updating alfadrink gins...");
      let foundUpdates = false;
      for (let item of data) {
        const dbGin = await alfadrinkGin.findOne({ name: item.name });
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
      if (!foundUpdates) logger.log("info", "Alfadrink.No updates found.");
    }
  } catch (error) {
    console.error(error);
  }
}

async function saveToDb(item) {
  const gin = new alfadrinkGin({
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
  let alfadrinkUrl = "https://www.alfadrink.ro/bauturi/gin/";
  const pages = await getPages();
  try {
    for (let page of pages) {
      try {
        const response = await axios.get(alfadrinkUrl + page);
        const $ = cheerio.load(response.data);
        $(".produs-lista").each((index, element) => {
          const name = $(element).find("h4").text().toUpperCase();
          const price = $(element)
            .find(".price>ins")
            .text()
            .replace(" lei", "");
          const gin = { name, price: parseFloat(price) };
          data.push(gin);
        });
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    logger.log("warning", error);
  }
  return data;
}

async function getPages() {
  let pages = [""];
  const url = "https://www.alfadrink.ro/bauturi/gin";
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const pageNumber = $("li.page-last>a").attr("data-ci-pagination-page");
  for (let i = 1; i < pageNumber; i++) {
    pages.push((i * 20).toString());
  }
  return pages;
}

module.exports.updateAlfadrink = updateAlfadrink;
module.exports.alfadrinkGin = alfadrinkGin;
