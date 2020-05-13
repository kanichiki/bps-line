const parts = require("../constants/messageParts");

exports.main = async () => {
    return [
        {
            "type": "text",
            "text": "招待ありがとうございます$\n\n現在、このアカウントではワードウルフで遊ぶことができます！\n\n$ゲーム参加者はこのアカウントを友達追加してください",
            "emojis":[
                {
                    "index":12,
                    "productId":"5ac21184040ab15980c9b43a",
                    "emojiId":"044"
                },
                {
                    "index":46,
                    "productId":"5ac21a18040ab15980c9b43e",
                    "emojiId":"048"
                }
            ]
        },
        {
            "type": "flex",
            "altText": "参加募集",
            "contents":{
                "type": "bubble",
                "body": {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "text": "開始するには「ワードウルフ」と発言するか下のボタンを押してください！",
                      "size": "sm",
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
                        "type": "message",
                        "label": "ワードウルフ",
                        "text": "ワードウルフ"
                      },
                      "color": parts.mainColor,
                      "style": "primary"
                    }
                  ]
                }
              }
        }
    ]
}