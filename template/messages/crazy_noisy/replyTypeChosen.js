const parts = require("../constants/messageParts");

exports.main = async (mode,text) => {
    let message="";
    if(text==1){
        message = "チャット(LINE)"
    }
    if(text==2){
        message = "通話"
    }
    if(text==3){
        message = "ビデオ通話"
    }
    return [
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
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "text",
                          "text": "以下の設定でゲームを開始してよろしいですか？",
                          "size": "md",
                          "wrap": true
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
                          "text": `モード : ${mode}`,
                          "size": "md"
                        },
                        {
                          "type": "text",
                          "text": `話し合い方法 : ${message}`,
                          "size": "md"
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