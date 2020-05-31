const parts = require("../constants/messageParts");
const wordWolfParts = require("./constants/messageParts");

/* ジャンル
exports.main = async (genreName,wolfNumberOptions) => {
    let wolfNumberMessages = [];
    for (let wolfNumberOption of wolfNumberOptions) {
        const wolfNumberMessage = {
            "type": "button",
            "style": "link",
            "height": "sm",
            "action": {
              "type": "message",
              "label": `${wolfNumberOption}人`,
              "text": `${wolfNumberOption}人`
            },
            "color": parts.mainColor
          }
        wolfNumberMessages.push(wolfNumberMessage);
    }
    return [
        {
            type: "text",
            text: `${genreName}が選ばれました！`
        },
        {
            "type": "flex",
            "altText": "ウルフの人数候補",
            "contents": {
                "type": "bubble",
                "body": {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "text": "ウルフの人数を選んでください",
                      "weight": "bold",
                      "size": "md"
                    }
                  ]
                },
                "footer": {
                  "type": "box",
                  "layout": "vertical",
                  "spacing": "sm",
                  "contents": wolfNumberMessages,
                  "flex": 0
                }
              }
        }
    ]
}
*/

// depth
exports.main = async (text,wolfNumberOptions) => {
  
  return [
      {
          type: "text",
          text: `難易度${text}が選ばれました！`
      },
      {
          "type": "flex",
          "altText": "ウルフの人数候補",
          "contents": await wordWolfParts.wolfNumberMessage(wolfNumberOptions)
      }
  ]
}

