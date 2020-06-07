const parts = require("../constants/messageParts");
const crazyNoisyParts = require("./constants/messageParts");



exports.main = async (userNumber,mode,type,timer) => {
  return [
      {
          "type": "flex",
          "altText": "設定確認",
          "contents": await crazyNoisyParts.settingConfirmMessage(userNumber,mode,type,timer)
      }
  ]
}