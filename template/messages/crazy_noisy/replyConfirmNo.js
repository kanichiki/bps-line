const parts = require("../constants/messageParts");
const crazyNoisyParts = require("./constants/messageParts");

exports.main = async (displayNames) => {

  return [
    {
      type: "text",
      text: `お手数ですが、設定を最初からやり直してください`
    },
    {
      "type": "flex",
      "altText": "モード",
      "contents": crazyNoisyParts.modeOptions
    }

  ]

}