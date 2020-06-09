const parts = require("../constants/messageParts");
const crazyNoisyParts = require("./constants/messageParts");

exports.main = async () => {

  return [
    {
      "type": "flex",
      "altText": "話し合い方法",
      "contents": crazyNoisyParts.typeOptions
    }

  ]

}