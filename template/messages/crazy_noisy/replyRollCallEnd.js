const parts = require("../constants/messageParts");
const crazyNoisyParts = require("./constants/messageParts");

exports.main = async (displayNames) => {

  const displayNamesSan = displayNames.join("さん、\n");

  return [
    {
      type: "text",
      text: `参加受付を終了します\n\n参加者は\n\n${displayNamesSan}さん\n\nです！\nゲームを途中で終了する際は「強制終了」と発言してください`
    },
    {
      "type": "flex",
      "altText": "モード",
      "contents": crazyNoisyParts.modeOptions
    }

  ]

}