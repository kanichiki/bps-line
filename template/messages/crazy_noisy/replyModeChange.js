const parts = require("../constants/messageParts");
const crazyNoisyParts = require("./constants/messageParts");

exports.main = async () => {

  return [
    {
      "type": "flex",
      "altText": "モード",
      "contents": crazyNoisyParts.modeOptions
    }

  ]

}