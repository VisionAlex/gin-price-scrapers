const conn = require("./db");
const { updateFinestore } = require("./scrapers/finestore");
const { updateSuperdrinks } = require("./scrapers/superdrinks");
const { updateAlfadrink } = require("./scrapers/alfadrink");
const { updateKing } = require("./scrapers/king");
const { updateExpertliquids } = require("./scrapers/expertliquids");
const { updateAlcooldiscount } = require("./scrapers/alcooldiscount");

function main() {
  updateFinestore();
  updateSuperdrinks();
  updateAlfadrink();
  updateExpertliquids();
  updateAlcooldiscount();
  updateKing();
}

main();
