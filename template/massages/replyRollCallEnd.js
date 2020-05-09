exports.main = async (names) => {
    return [
        {
            type: "text",
            text: `点呼を終了します`
        },
        {
            type: "text",
            text: `参加者は\n${names}さん\nです！`
        },
        {
            type: "text",
            text: `ゲームを開始します`
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
                  "type": "text",
                  "text": "ワードのジャンルを選んでください。",
                  "wrap": true,
                  "style": "normal",
                  "size": "md"
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
                    "label": "食べ物",
                    "text": "食べ物"
                  }
                }
              ]
            }
          }
        }
    ]

}