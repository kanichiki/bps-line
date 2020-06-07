const parts = require("../constants/messageParts");

exports.main = async (displayNames, wolfIndexes, lunaticIndexes, citizenWord, wolfWord) => {
    let resultMessage = "それぞれの単語は以下の通りです\n\n";

    let result = [];
    for (let i = 0; i < displayNames.length; i++) {
        let word = ""
        if (wolfIndexes.indexOf(i) == -1) {
            if (lunaticIndexes.indexOf(i) == -1) {
                word = "・" + displayNames[i] + " : " + citizenWord;
            } else {
                word = "・" + displayNames[i] + " : " + citizenWord + " ←狂人";
            }
        } else {
            if (lunaticIndexes.indexOf(i) == -1) {
                word = "・" + displayNames[i] + " : " + wolfWord + " ←ウルフ";
            } else {
                word = "・" + displayNames[i] + " : " + wolfWord + " ←ウルフ&狂人";
            }
        }
        result.push(word);
    }

    const resultEnter = result.join("\n");
    resultMessage = resultMessage + resultEnter;

    return [
        {
            type: "text",
            text: resultMessage
        },
        {
            "type": "flex",
            "altText": "役職確認",
            "contents": {
                "type": "bubble",
                "size": "mega",
                "body": {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "text": "サービス向上のためフィードバックにご協力ください！",
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
                        "label": "フィードバックを書く",
                        "uri": "https://forms.gle/kGHqE924ACYQmTKj7",
                        "altUri": {
                          "desktop": "https://forms.gle/kGHqE924ACYQmTKj7"
                        }
                      },
                      "color": parts.mainColor,
                      "style": "primary"
                    },
                    /* {
                      "type": "button",
                      "action": {
                        "type": "uri",
                        "label": "Twitterでシェア",
                        "uri": "http://twitter.com/share?text=test",
                        "altUri": {
                          "desktop": "http://twitter.com/share?text=test"
                        }
                      },
                      "color": "#00acee"
                    }, */
                    {
                      "type": "button",
                      "action": {
                        "type": "message",
                        "label": "ゲーム一覧",
                        "text": "ゲーム一覧"
                      },
                      "color": parts.mainColor,
                    }
                  ]
                }
              }
        }
    ]
}