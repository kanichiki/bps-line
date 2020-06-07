const parts = require("../constants/messageParts");
const wordWolfParts = require("./constants/messageParts");



exports.main = async (userNumber,depth,wolfNumber,lunaticNumber,timer) => {
  return [
      {
          "type": "flex",
          "altText": "設定確認",
          "contents": await wordWolfParts.settingConfirmMessage(userNumber,depth,wolfNumber,lunaticNumber,timer)
      }
  ]
}