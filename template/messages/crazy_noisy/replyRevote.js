const parts = require("../../constants/messageParts");

exports.main = async (displayNames,userIds, mostVotedUserIndexes) => {
    let revoteMessages = [];

    for (let mostVotedUserIndex of mostVotedUserIndexes) {
        const revoteMessage = {
            "type": "button",
            "action": {
                "type": "postback",
                "label": displayNames[mostVotedUserIndex],
                "data": userIds[mostVotedUserIndex]
            },
            "color": parts.mainColor
        }
        revoteMessages.push(revoteMessage);
    }
    
    return [
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
                                    "text": "教祖だと思う人に再度投票してください",
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