exports.main = async (shuffleUserIndexes, displayNames, userIndex) => {
    let voteMessages = [];

    for (let i = 0; i < shuffleUserIndexes.length; i++) {
        // 個チャ相手の投票欄は消しとく
        if (shuffleUserIndexes[i] != userIndex) {
            const voteMessage = {
                "type": "button",
                "action": {
                    "type": "message",
                    "label": displayNames[i],
                    "text": shuffleUserIndexes[i]
                }
            }
            voteMessages.push(voteMessage);
        }
    }


    return [
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