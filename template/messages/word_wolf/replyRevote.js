exports.main = async (voterDisplayName, displayNames,userIds, mostVotedUserIndexes) => {
    let revoteMessages = [];

    for (let mostVotedUserIndex of mostVotedUserIndexes) {
        const revoteMessage = {
            "type": "button",
            "action": {
                "type": "postback",
                "label": displayNames[mostVotedUserIndex],
                "data": userIds[mostVotedUserIndex]
            },
            "color": "#E83b10"
        }
        revoteMessages.push(revoteMessage);
    }
    
    return [
        {
            type: "text",
            text: `${voterDisplayName}さん、投票完了しました！`
        },
        {
            type: "text",
            text: `得票数が並んだため再投票に入ります`
        },
        {
            "type": "flex",
            "altText": "再投票",
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
                                    "text": "ウルフだと思う人に再度投票してください",
                                    "size": "md",
                                    "wrap": true
                                }
                            ]
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "contents": revoteMessages
                    }
                    ]
                }
            }
        }
    ]
}