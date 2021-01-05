const conn = require("./db");
const stringSimilarity = require("string-similarity");
const { finestoreGin } = require("./scrapers/finestore");
const { superdrinksGin } = require("./scrapers/superdrinks");
const { alfadrinkGin } = require("./scrapers/alfadrink");
const { kingGin } = require("./scrapers/king");
const { expertliquidsGin } = require("./scrapers/expertliquids");
const { alcooldiscountGin } = require("./scrapers/alcooldiscount");
const { aggregateGin } = require("./models/aggregateModel");
const { theginisinRating } = require("./scrapers/theginisin");

async function populatePricesWithSameName(dbModel) {
  const collectionName = dbModel.collection.name.replace("gins", "");
  const aggregateGinData = await aggregateGin.find({});
  const data = await dbModel.find({});
  for (let dbGin of aggregateGinData) {
    for (let gin of data) {
      const dbNameCleaned = dbGin.name.replace(/ GIN/g, "").trim();
      const modelNameCleaned = gin.name.replace(/ GIN/g, "").trim();
      if (dbNameCleaned === modelNameCleaned) {
        dbGin[`${collectionName}Price`] = gin.price;
        await dbGin.save();
        console.log(dbGin);
      }
    }
  }
  console.log("Finished operation");
}

async function populateRatings(ratingModel) {
  const collectionName = ratingModel.collection.name.replace("ratings", "");
  const ratingsData = await ratingModel.find({}).lean();
  const aggregateGinData = await aggregateGin.find({});
  for (let dbGin of aggregateGinData) {
    for (let gin of ratingsData) {
      const dbNameCleaned = dbGin.name
        .replace(/ GIN/g, "")
        .replace(/\d(\.\d){0,1}L/, "")
        .replace("'", "")
        .replace(".", "")
        .replace(/ CU PAHAR/, "")
        .trim();
      const ratingNameCleaned = gin.name
        .replace(/ GIN/g, "")
        .replace(/\d{2}(\.\d){0,1}\%/, "")
        .replace("’", "")
        .replace(".", "")
        .trim();
      const similarity = stringSimilarity.compareTwoStrings(
        dbNameCleaned,
        ratingNameCleaned
      );
      if (similarity > 0.89) {
        dbGin[`${collectionName}Rating`] = gin.rating;
        dbGin[`${collectionName}Link`] = gin.link;
        await dbGin.save();
        console.log(dbGin);
      }
    }
  }
  console.log("Finished Operation.");
}

async function firstPopulate(dbModel) {
  const collectionName = dbModel.collection.name.replace("gins", "");
  const data = await dbModel.find({});
  for (let item of data) {
    const itemToAdd = {
      name: item.name,
    };
    itemToAdd[`${collectionName}Price`] = item.price;
    const gin = new aggregateGin(itemToAdd);
    await gin.save();
  }
}

// async function populatePricesWithDifferentName(dbModel) {
//   let notMatched = [];
//   const data = await dbModel.find({});
//   const number = await dbModel.countDocuments();
//   let count = 0;
//   for (gin of data) {
//     const matchedGin = await aggregateGin.find({ name: gin.name });
//     if (!matchedGin) {
//       notMatched.push(gin);
//     } else count++;
//   }
//   console.log(notMatched, number, count);
// }
