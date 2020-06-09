const parts = require("../constants/messageParts");
const wordWolfParts = require("./constants/messageParts");

exports.main = async (lunaticNumberOptions) => {
  
  return [
    {
      "type": "flex",
      "altText": "狂人の人数候補",
      "contents": await wordWolfParts.lunaticNumberMessage(lunaticNumberOptions)
    }
  ]
}