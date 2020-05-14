const parts = require("../../constants/messageParts");

/* ジャンル
exports.main = async (displayNames, genres) => {

    let genreMessages = [];
    for (let id in genres) {
        const genreMessage = {
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "button",
                        "action": {
                            "type": "message",
                            "label": genres[id],
                            "text": genres[id]
                        },
                        "color": parts.mainColor,
                        "style": "link"
                    }
                ]
            }
        }
        genreMessages.push(genreMessage);
    }

    const displayNamesSan = displayNames.join("さん、\n");

    return [
        {
            type: "text",
            text: `参加受付を終了します`
        },
        {
            type: "text",
            text: `参加者は\n\n${displayNamesSan}さん\n\nです！`
        },
        {
            type: "text",
            text: `ワードのジャンルを選んでください`
        },
        {
            "type": "flex",
            "altText": "ワードのジャンル候補",
            "contents": {
                "type": "carousel",
                "contents": genreMessages
            }
        }
    ]

}
*/

// depth
exports.main = async (displayNames, depths) => {

    // let depthMessages = [];
    // for (let depth in depths) {
    //     const depthMessage = {
    //         "type": "bubble",
    //         "body": {
    //             "type": "box",
    //             "layout": "vertical",
    //             "contents": [
    //                 {
    //                     "type": "button",
    //                     "action": {
    //                         "type": "message",
    //                         "label": depth,
    //                         "text": depth
    //                     },
    //                     "color": parts.mainColor,
    //                     "style": "link"
    //                 }
    //             ]
    //         }
    //     }
    //     depthMessages.push(depthMessage);
    // }

    const displayNamesSan = displayNames.join("さん、\n");

    return [
        {
            type: "text",
            text: `参加受付を終了します`
        },
        {
            type: "text",
            text: `参加者は\n\n${displayNamesSan}さん\n\nです！`
        },
        {
            "type": "flex",
            "altText": "ワードの難易度",
            "contents": {
                "type": "bubble",
                "body": {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "text": "ワードの難易度を選んでください"
                    }
                  ]
                },
                "footer": {
                  "type": "box",
                  "layout": "horizontal",
                  "contents":  [
                    {
                      "type": "button",
                      "action": {
                        "type": "message",
                        "label": "1",
                        "text": "1"
                      },
                      "color": parts.mainColor
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "message",
                        "label": "2",
                        "text": "2"
                      },
                      "color": parts.mainColor
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "message",
                        "label": "3",
                        "text": "3"
                      },
                      "color": parts.mainColor
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "message",
                        "label": "4",
                        "text": "4"
                      },"color": parts.mainColor
                    }
                  ]
                }
              }
        }
    ]

}