exports.main = async (userIndexes, profiles) => {
    let voteMessages = [];

    for (let i = 0; i < userIndexes.length; i++) {
        const voteMessage = {
            "type": "button",
            "action": {
                "type": "postback",
                "label": profiles[i],
                "data": userIndexes[i]
            }
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