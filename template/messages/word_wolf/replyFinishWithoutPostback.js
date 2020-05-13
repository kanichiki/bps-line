exports.main = async () => {

    return [
        {
            type: "text",
            text: `話し合いを終了します`
        },
        {
            type: "text",
            text: `みなさん、個人チャットにて投票を完了してください`
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