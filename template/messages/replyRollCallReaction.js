exports.main = async (recruitingGameName,displayName,isUserParticipant,displayNames) => {
    let messageText = "";
    
    if(!isUserParticipant){
        messageText = displayName + "さんの参加を確認しました！";
    }else{
        messageText = displayName + "さんは既に参加済みです";
    }

    const displayNamesSan = displayNames.join("さん、\n");
    
    return [
        {
            type: "text",
            text: messageText
        },
        {
            type: "text",
            text: `現在の参加者は\n${displayNamesSan}さん\nです！\n引き続き${recruitingGameName}の参加者を募集します！`
        },
        {
            "type": "flex",
            "altText": "参加募集",
            "contents": {
                "type": "bubble",
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "sm",
                    "contents": [
                        {
                            "type": "button",
                            "style": "link",
                            "height": "sm",
                            "action": {
                                "type": "message",
                                "label": "参加",
                                "text": "参加"
                            }
                        },
                        {
                            "type": "button",
                            "style": "link",
                            "height": "sm",
                            "action": {
                                "type": "message",
                                "label": "参加受付終了",
                                "text": "参加受付終了"
                            }
                        },
                        {
                            "type": "spacer",
                            "size": "sm"
                        }
                    ],
                    "flex": 0
                }
            }
        }
    ]
}