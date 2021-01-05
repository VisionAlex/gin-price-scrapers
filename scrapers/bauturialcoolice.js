const logger = require("../log/logger");
const cheerio = require("cheerio");
const axios = require("axios");
const storeSchema = require("../models/mainSchema");
const conn = require("../db");

async function getPageNumber() {
  const response = await axios.get("https://bauturialcoolice.ro/gin?limit=100");
  const $ = cheerio.load(response.data);
  console.log($(".caption").text());
}

getPageNumber();
