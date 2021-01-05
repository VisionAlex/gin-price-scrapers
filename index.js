const { aggregateGin } = require("./models/aggregateModel");

async function main() {
  const data = await aggregateGin
    .find({ theginisinRating: { $gte: 4 } })
    .sort("-theginisinRating");
  console.log(data);
}

main();
