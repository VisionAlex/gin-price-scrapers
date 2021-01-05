const conn = require("./db");
const stringSimilarity = require("string-similarity");
const { finestoreGin } = require("./scrapers/finestore");
const { superdrinksGin } = require("./scrapers/superdrinks");
const { alfadrinkGin } = require("./scrapers/alfadrink");
const { kingGin } = require("./scrapers/king");
const { expertliquidsGin } = require("./scrapers/expertliquids");
const { alcooldiscountGin } = require("./scrapers/alcooldiscount");
const { theginisinRating } = require("./scrapers/theginisin");

async function main() {
  const data1 = await finestoreGin.find({});
  const data2 = await alfadrinkGin.find({});
  const data3 = await expertliquidsGin.find({});
  const data4 = await superdrinksGin.find({});
  const data5 = await alcooldiscountGin.find({});
  const data6 = await kingGin.find({});

  const finestoreData = priceSearch(data1);
  const alfadrinkData = priceSearch(data2);
  const expertliquidsData = priceSearch(data3);
  const superdrinksData = priceSearch(data4);
  const alcooldiscountData = priceSearch(data5);
  const kingGinData = priceSearch(data6);

  const ratingData = await getRatingsData();
  let combinedData1 = combineGinAndRating(finestoreData, ratingData);
  let combinedData2 = combineGinAndRating(alfadrinkData, ratingData);
  let combinedData3 = combineGinAndRating(expertliquidsData, ratingData);
  let combinedData4 = combineGinAndRating(superdrinksData, ratingData);
  let combinedData5 = combineGinAndRating(alcooldiscountData, ratingData);
  let combinedData6 = combineGinAndRating(kingGinData, ratingData);
  console.log(combinedData6);
}

async function getRatingsData() {
  let data = [];
  const ratingData = await theginisinRating.find({ rating: { $gte: 4 } });
  for (let item of ratingData) {
    const name = item.name
      .replace(/ GIN/g, "")
      .replace(/\d{2}(\.\d){0,1}\%/, "")
      .trim();
    data.push({ name, rating: item.rating });
  }
  return data;
}

function combineGinAndRating(data, ratingData) {
  let combinedData = [];
  for (let gin of data) {
    for (let ginRating of ratingData) {
      similarity = stringSimilarity.compareTwoStrings(gin.name, ginRating.name);
      if (similarity > 0.75) {
        combinedData.push({
          name: gin.name,
          otherName: ginRating.name,
          price: gin.price,
          rating: ginRating.rating,
          similarity: similarity,
        });
      }
    }
  }
  combinedData.sort((a, b) => {
    if (a.rating === b.rating) return a.price - b.price;
    return b.rating - a.rating;
  });
  return combinedData;
}

function priceSearch(data) {
  let newData = [];
  for (let item of data) {
    if (item.price > 60 && item.price < 160) {
      item.name = item.name
        .replace(/\d(\.\d){0,1}L/, "")
        .replace(/ GIN/g, "")
        .replace(/CU PAHAR/g, "")
        .trim();
      newData.push({ name: item.name, price: item.price });
    }
  }
  return newData;
}
