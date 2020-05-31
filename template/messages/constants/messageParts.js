const mainColor = "#E83b10"
const subColor = "#036568"

exports.mainColor = mainColor;
exports.subColor = subColor;

exports.voteMessage = async (displayNames, userIds) => {
    let voteMessages = [];

    // どうやら整数は送れないらしい
    for (let i = 0; i < userIds.length; i++) {
        const voteMessage = {
            "type": "bubble",
            "size": "micro",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "button",
                        "action": {
                            "type": "postback",
                            "label": displayNames[i],
                            "data": userIds[i]
                        },
                        "color": mainColor
                    }
                ]
            }
        }

        voteMessages.push(voteMessage);
    }
    return voteMessages;
}

exports.revoteMessage = async (displayNames, userIds, userIndexes) => {
    let voteMessages = [];

    // どうやら整数は送れないらしい
    for (let userIndex of userIndexes) {
        const voteMessage = {
            "type": "bubble",
            "size": "micro",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "button",
                        "action": {
                            "type": "postback",
                            "label": displayNames[userIndex],
                            "data": userIds[userIndex]
                        },
                        "color": mainColor
                    }
                ]
            }
        }

        voteMessages.push(voteMessage);
    }
    return voteMessages;
}

exports.gamesMessage = async () => {
    return {
        "type": "carousel",
        "contents": [
          {
            "type": "bubble",
            "size": "mega",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "ワードウルフ",
                  "size": "xl",
                  "style": "normal",
                  "color": mainColor,
                  "align": "center",
                  "offsetTop": "10px"
                }
              ],
              "spacing": "none",
              "margin": "none"
            },
            "footer": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "少数派を見つけ出す",
                  "align": "center",
                  "size": "lg"
                },
                {
                  "type": "text",
                  "text": "トークゲーム！",
                  "align": "center",
                  "size": "lg"
                },
                {
                  "type": "button",
                  "action": {
                    "type": "uri",
                    "label": "詳しい説明はこちら",
                    "uri": "https://note.com/m_dabyss/n/nb741cd926bf9",
                    "altUri": {
                      "desktop": "https://note.com/m_dabyss/n/nb741cd926bf9"
                    }
                  },
                  "color": subColor
                },
                {
                  "type": "button",
                  "action": {
                    "type": "message",
                    "label": "ワードウルフを始める",
                    "text": "ワードウルフ"
                  },
                  "style": "primary",
                  "margin": "md",
                  "color": mainColor
                }
              ],
              "spacing": "none",
              "margin": "none"
            }
          },
          {
            "type": "bubble",
            "size": "mega",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "クレイジーノイジー",
                  "size": "xl",
                  "style": "normal",
                  "color": mainColor,
                  "align": "center",
                  "offsetTop": "10px"
                }
              ],
              "spacing": "none",
              "margin": "none"
            },
            "footer": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "みんな狂っていく",
                  "align": "center",
                  "size": "lg"
                },
                {
                  "type": "text",
                  "text": "新感覚オリジナルゲーム！",
                  "align": "center",
                  "size": "lg"
                },
                {
                  "type": "button",
                  "action": {
                    "type": "uri",
                    "label": "詳しい説明はこちら",
                    "altUri": {
                      "desktop": "https://note.com/m_dabyss/n/n0c37924b4f2e"
                    },
                    "uri": "https://note.com/m_dabyss/n/n0c37924b4f2e"
                  },
                  "color": subColor
                },
                {
                  "type": "button",
                  "action": {
                    "type": "message",
                    "label": "クレイジーノイジーを始める",
                    "text": "ワードウルフ"
                  },
                  "style": "primary",
                  "margin": "md",
                  "color": mainColor
                }
              ],
              "spacing": "none",
              "margin": "none"
            }
          }
        ]
      }
}