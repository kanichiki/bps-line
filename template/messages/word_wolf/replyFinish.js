const parts = require("../constants/messageParts");

exports.main = async (displayNames, userIds) => {

    let voteMessages = [];

    // どうやら整数は送れないらしい
    for (let i = 0; i < userIds.length; i++) {
        /*
        const voteMessage = {
            "type": "button",
            "action": {
                "type": "postback",
                "label": displayNames[i],
                "data": userIds[i]
            },
            "color": parts.mainColor
        }*/
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
                        "color": parts.mainColor
                    }
                ]
            }
        }

        voteMessages.push(voteMessage);
    }


    return [
        {
            type: "text",
            text: `話し合い時間が終了しました`
        },
        {
            "type": "flex",
            "altText": "投票",
            "contents": {
                "type": "bubble",
                "size": "giga",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "みなさん投票してください",
                            "wrap": true,
                            "align": "center"
                        }
                    ]
                }
            }
        },
        /*
        {
            "type": "flex",
            "altText": "投票",
            "contents": {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "ウルフだと思う人に投票してください",
                            "wrap": true,
                            "size": "md"
                        }
                    ]
                },
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": voteMessages
                }
            }
        }
        */
        {
            "type": "flex",
            "altText": "投票",
            "contents": {
                "type": "carousel",
                "contents": await parts.voteMessage(displayNames,userIds)
            }
        }
    ]


    /*  iPhoneとiPadのみ動かない
    return [
        {
            type: "text",
            text: `話し合いを終了します`
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
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "ウルフだと思う人に投票してください",
                                    "size": "md",
                                    "wrap": true
                                }
                            ]
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "contents": voteMessages
                    }
                    ]
                }
            }
        }
    ]
    */

    /* let voteMessages = [];

    for (let i = 0; i < userIndexes.length; i++) {
        const voteMessage =
        {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "text",
                    "text": profiles[i],
                    "size": "xl",
                    "wrap": true,
                    "align": "center",
                    "action": {
                        "type": "postback",
                        "label": profiles[i],
                        "data": userIndexes[i]
                    }
                },
                {
                    "type": "spacer",
                    "size": "lg"
                }
            ]
        }

        voteMessages.push(voteMessage);
    }

    return [
        {
            type: "text",
            text: `話し合いを終了します`
        },
        {
            "type": "flex",
            "altText": "This is a Flex Message",
            "contents": {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": voteMessages
                }
            }
        }
    ]
    */
}