const parts = require("../constants/messageParts");
const crazyNoisyParts = require("./constants/messageParts");

exports.main = async (text) => {

  return [
    {
      type: "text",
      text: `${text}モードが選択されました！`
    },
    {
      "type": "flex",
      "altText": "話し合い方法",
      "contents": crazyNoisyParts.typeOptions
    }

  ]

}