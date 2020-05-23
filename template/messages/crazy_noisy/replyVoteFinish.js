const parts = require("../../constants/messageParts");

exports.main = async (executorDisplayName,day) => {
    return [
        {
            type: "text",
            text: `${executorDisplayName}さんは教祖ではなかったようですが、拷問の結果気が狂ってしまいました`
        },
        {
            "type": "flex",
            "altText": "設定確認",
            "contents": {
                "type": "bubble",
                "body": {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "text": `${day}日目の夜になりました`
                    },
                    {
                      "type": "text",
                      "text": "各自アクションをしてください"
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
                        "label": "アクションする",
                        "uri": `https://line.me/R/oaMessage/${process.env.channelId}/`,
                        "altUri": {
                          "desktop": `https://line.me/R/oaMessage/${process.env.channelId}/`
                        }
                      },
                      "color":parts.mainColor
                    }
                  ]
                }
              }

        }
    ]
}