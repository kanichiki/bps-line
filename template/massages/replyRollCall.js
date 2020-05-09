exports.main = async (messageText,pro) => {
    return [
        {
          type: "text",
          text: `${messageText}`
        },
        {
          type: "text",
          text: `現在の参加者は\n${pro.displayName}さん\nです！`
        },
        {
          "type": "flex",
          "altText": "This is a Flex Message",
          "contents": {
            "type": "bubble",
            "footer": {
              "type": "box",
              "layout": "vertical",
              "spacing": "sm",
              "contents": [
                {
                  "type": "button",
                  "style": "link",
                  "height": "sm",
                  "action": {
                    "type": "message",
                    "label": "元気です",
                    "text": "元気です"
                  }
                },
                {
                  "type": "button",
                  "style": "link",
                  "height": "sm",
                  "action": {
                    "type": "message",
                    "label": "点呼終了",
                    "text": "点呼終了"
                  }
                },
                {
                  "type": "spacer",
                  "size": "sm"
                }
              ],
              "flex": 0
            }
          }
        }
      ]

}