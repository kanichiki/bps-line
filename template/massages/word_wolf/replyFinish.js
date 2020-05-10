exports.main = async (userIndexes, profiles) => {
    let voteMassges = [];
    for (let i = 0; i < userIndexes.length; i++) {
        const voteMassage = {
            "type": "button",
            "action": {
                "type": "postback",
                "label": profiles[i],
                "data": userIndexes[i]
            }
        }
        voteMassges.push(voteMassage);
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
                            "contents": voteMassges
                    }
                    ]
                }
            }
        }
    ]
}