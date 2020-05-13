const parts = require("../../constants/messageParts");

/* ジャンル
exports.main = async (wolfNumber, genreName) => {
    return [
        {
            type: "text",
            text: `ウルフは${wolfNumber}人ですね！`
        },
        {
            "type": "flex",
            "altText": "This is a Flex Message",
            "contents": {
                "type": "bubble",
                "body": {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "text",
                          "text": "以下の内容でよろしいですか？",
                          "size": "md"
                        }
                      ]
                    },
                    {
                      "type": "separator",
                      "margin": "md"
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "spacer"
                        },
                        {
                          "type": "text",
                          "text": `ジャンル : ${genreName}`,
                          "size": "md"
                        },
                        {
                          "type": "text",
                          "text": `ウルフ : ${wolfNumber}人`
                        }
                      ]
                    }
                  ]
                },
                "footer": {
                  "type": "box",
                  "layout": "horizontal",
                  "spacing":"sm",
                  "contents": [
                    {
                      "type": "button",
                      "style": "link",
                      "height": "sm",
                      "action": {
                        "type": "message",
                        "label": "はい",
                        "text": "はい"
                      },
                      "color": parts.mainColor,
                      "style": "primary"
                    },
                    {
                      "type": "separator"
                    },
                    {
                      "type": "button",
                      "style": "link",
                      "height": "sm",
                      "action": {
                        "type": "message",
                        "label": "いいえ",
                        "text": "いいえ"
                      },
                      "color": parts.mainColor
                    }
                  ]
                }
              }
        }
    ]
}
*/

// depth

exports.main = async (wolfNumber, depth) => {
  return [
      {
          type: "text",
          text: `ウルフは${wolfNumber}人ですね！`
      },
      {
          "type": "flex",
          "altText": "This is a Flex Message",
          "contents": {
              "type": "bubble",
              "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "text",
                        "text": "以下の内容でよろしいですか？",
                        "size": "md"
                      }
                    ]
                  },
                  {
                    "type": "separator",
                    "margin": "md"
                  },
                  {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "spacer"
                      },
                      {
                        "type": "text",
                        "text": `難易度 : ${depth}`,
                        "size": "md"
                      },
                      {
                        "type": "text",
                        "text": `ウルフ : ${wolfNumber}人`
                      }
                    ]
                  }
                ]
              },
              "footer": {
                "type": "box",
                "layout": "horizontal",
                "spacing":"sm",
                "contents": [
                  {
                    "type": "button",
                    "style": "link",
                    "height": "sm",
                    "action": {
                      "type": "message",
                      "label": "はい",
                      "text": "はい"
                    },
                    "color": parts.mainColor,
                    "style": "primary"
                  },
                  {
                    "type": "separator"
                  },
                  {
                    "type": "button",
                    "style": "link",
                    "height": "sm",
                    "action": {
                      "type": "message",
                      "label": "いいえ",
                      "text": "いいえ"
                    },
                    "color": parts.mainColor
                  }
                ]
              }
            }
      }
  ]
}