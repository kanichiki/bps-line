const parts = require("../constants/messageParts");
const crazyNoisyParts = require("./constants/messageParts");

exports.main = async (displayName, position, isBrainwash, targetDisplayNames, targetUserIds, zeroGuru, zeroDetective) => {
    let actionMessage = "";
    let targetMessages = [
        {
            "type": "spacer"
        }
    ]

    if (position == crazyNoisyParts.guru && zeroGuru) {

        actionMessage = "洗脳する人を選んでください";
        for (let i = 0; i < targetDisplayNames.length; i++) {
            const targetMessage = {
                "type": "button",
                "action": {
                    "type": "postback",
                    "label": targetDisplayNames[i],
                    "data": targetUserIds[i]
                },
                "color": parts.mainColor
            }
            targetMessages.push(targetMessage);
        }
    } else if (position == crazyNoisyParts.detective && zeroDetective) {

        actionMessage = "調査する人を選んでください";
        for (let i = 0; i < targetDisplayNames.length; i++) {
            const targetMessage = {
                "type": "button",
                "action": {
                    "type": "postback",
                    "label": targetDisplayNames[i],
                    "data": targetUserIds[i]
                },
                "color": parts.mainColor
            }
            targetMessages.push(targetMessage);
        }


    } else {
        actionMessage = "役職を確認したら下のボタンを押してください！";
        const targetMessage = {
            "type": "button",
            "action": {
                "type": "postback",
                "label": "確認しました",
                "data": "確認しました"
            },
            "color": parts.mainColor
        }
        targetMessages.push(targetMessage);
    }





    return [
        {
            "type": "flex",
            "altText": "アクション",
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
                                    "size": "md",
                                    "contents": [
                                        {
                                            "type": "span",
                                            "text": `${displayName}さんの役職は『`
                                        },
                                        {
                                            "type": "span",
                                            "text": position,
                                            "weight": "bold",
                                            "color": parts.mainColor
                                        },
                                        {
                                            "type": "span",
                                            "text": "』です"
                                        }
                                    ],
                                    "wrap": true
                                },
                                {
                                    "type": "text",
                                    "text": actionMessage,
                                    "size": "md",
                                    "wrap": true
                                }
                            ]
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "contents": targetMessages
                        }
                    ]
                }
            }
        }
    ]
}