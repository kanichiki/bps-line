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
                          "text": "以下の内容でよろしいですよね？",
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
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "button",
                      "action": {
                        "type": "message",
                        "label": "はい！",
                        "text": "はい！"
                      }
                    }
                  ]
                }
              }
        }
    ]
}