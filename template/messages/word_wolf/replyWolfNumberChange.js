const parts = require("../constants/messageParts");
const wordWolfParts = require("./constants/messageParts");

exports.main = async (wolfNumberOptions) => {
  
  return [
      {
          "type": "flex",
          "altText": "ウルフの人数候補",
          "contents": await wordWolfParts.wolfNumberMessage(wolfNumberOptions)
      }
  ]
}

