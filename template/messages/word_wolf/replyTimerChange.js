const parts = require("../constants/messageParts");
const wordWolfParts = require("./constants/messageParts");

exports.main = async () => {
  
  return [
    {
      "type": "flex",
      "altText": "議論時間変更",
      "contents": await wordWolfParts.timerMessage()
    }
  ]
}