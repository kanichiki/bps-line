const parts = require("../constants/messageParts");

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
                "type": "carousel",
                "contents": await parts.revoteMessage(displayNames,userIds,mostVotedUserIndexes)
            }
        },
        {
            "type": "flex",
            "altText": "投票状況確認",
            "contents": {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        
                        {
                            "type": "text",
                            "text": "未投票者は下のボタンで確認できます！",
                            "wrap": true
                        }
                    ]
                },
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "button",
                            "action": {
                                "type": "postback",
                                "data": "投票状況確認",
                                "label": "投票状況確認"
                            },
                            "color": parts.mainColor,
                            "style": "primary"
                        }
                    ]
                }
            }
        }
    ]
}