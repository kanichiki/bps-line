const parts = require("../constants/messageParts");
const crazyNoisyParts = require("./constants/messageParts");

exports.main = async (userNumber, numberOption) => {

  return [
    
    {
      "type": "flex",
      "altText": "役職人数確認",
      "contents": await crazyNoisyParts.positionNumberMessage(userNumber,numberOption)
    },
    {
      "type": "flex",
      "altText": "役職確認",
      "contents": {
        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "それぞれの役職を個人トークルームにて確認してください",
              "wrap": true
            },
            {
              "type": "text",
              "text": "役職を確認した方は個人トークルームにて「確認しました」ボタンを押してください",
              "wrap": true
            }
          ]
        },
        "footer": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "button",
              "action": {
                "type": "uri",
                "label": "役職を確認する",
                "uri": `https://line.me/R/oaMessage/${process.env.channelId}/`,
                "altUri": {
                  "desktop": `https://line.me/R/oaMessage/${process.env.channelId}/`
                }
              },
              "color": parts.mainColor
            },
            {
              "type": "button",
              "action": {
                "type": "postback",
                "label": "確認状況",
                "data": "確認状況"
              },
              "color": parts.subColor,
              "margin": "sm"
            } //,
            // {
            //   "type": "separator",
            //   "margin": "sm"
            // },
            // {
            //   "type": "button",
            //   "action": {
            //     "type": "postback",
            //     "label": "確認しました",
            //     "data": "確認しました"
            //   },
            //   "color": parts.mainColor,
            //   "style": "primary",
            //   "margin": "sm"
            // }
          ]
        }
      }
    }
  ]
}