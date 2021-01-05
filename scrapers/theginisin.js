const cheerio = require("cheerio");
const axios = require("axios");
const mongoose = require("mongoose");
const conn = require("../db");

const ratingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number },
  distillery: { type: String },
  link: { type: String },
});

const theginisinRating = conn.model("theginisinRating", ratingSchema);

async function getRatings() {
  let data = [];
  const url = "https://theginisin.com/gin-reviews-list/";
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  $(".list li h4").each((index, element) => {
    try {
      const name = $(element)
        .attr("data-brand")
        .toUpperCase()
        .replace("`", "'");
      const distillery = $(element).attr("data-distillery").toUpperCase();
      const rating = $(element).children("span").attr("data-score");
      const link = $(element).children("a").attr("href");
      data.push({ name, distillery, rating, link });
    } catch (error) {
      console.log(error);
    }
  });
  return data;
}

async function updateRatings() {
  const data = await getRatings();
  for (let item of data) {
    gin = new theginisinRating(item);
    await gin.save();
    console.log(`${gin.name}`);
  }
}

// updateRatings();
module.exports.theginisinRating = theginisinRating;
