const parts = require("../../constants/messageParts");
const crazyNoisyParts = require("./constants/messageParts");

exports.main = async (displayName, position,isBrainwash, targetDisplayNames, targetUserIds) => {
    let actionMessage = "";
    let targetMessages = [
        {
            "type": "spacer"
        }
    ]

    if (position == crazyNoisyParts.guru || position == crazyNoisyParts.detective) {
        if (position == crazyNoisyParts.guru) {
            actionMessage = "洗脳する人を選んでください";
            for (let i=0;i<targetDisplayNames.length;i++) {
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
            if(isBrainwash){
                actionMessage = "狂っているため調査できません";
            }else{
                actionMessage = "調査する人を選んでください";
                for (let i=0;i<targetDisplayNames.length;i++) {
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
            }
        }

    } else {
        actionMessage = "アクションはありません";
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