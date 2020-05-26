const parts = require("../constants/messageParts");

exports.main = async (userNumber,numberOption) => {
  let detectiveNumber = ""
  let citizenNumber = ""
  
  if(userNumber>6){
    detectiveNumber = "1";
    citizenNumber = `${userNumber-numberOption-2}~${userNumber-numberOption-1}`
  } else {
    detectiveNumber = `0~1`
    citizenNumber = `${userNumber-numberOption*2-1}~${userNumber-numberOption*2+1}`
  } 
  
  return [
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
                      "text": "ゲームをスタートします",
                      "wrap": true
                    },
                    {
                      "type": "text",
                      "text": "それぞれの役職を個人トークルームにて確認してください",
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
                      "color":parts.mainColor
                    }
                  ]
                }
              }
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
                  "text": "各役職の人数は以下の通りです",
                  "size": "md",
                  "wrap": true
                },
                {
                  "type": "separator",
                  "margin": "md"
                },
                {
                  "type": "text",
                  "text": "教祖 : 1人",
                  "margin": "md"
                },
                {
                  "type": "text",
                  "text": `狂信者 : ${numberOption-1}~${numberOption}人`
                },
                {
                  "type": "text",
                  "text": `探偵 : ${detectiveNumber}人`
                },
                {
                  "type": "text",
                  "text": `市民 : ${citizenNumber}人`
                }
              ]
            }
          }
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
                    "text": "役職を確認した方は「確認」ボタンを押してください",
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
                      "type": "postback",
                      "label": "確認",
                      "data": "確認"
                    },
                    "color":parts.mainColor,
                    "style": "primary"
                  }
                ]
              }
            }
      }
    ]
}