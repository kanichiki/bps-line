exports.main = async (messageText, pro) => {
    if (pro == null) {
        return [
            {
                type: "text",
                text: `${messageText}`
            }
        ]
    } else {
        return [
            {
                type: "text",
                text: `${messageText}`
            },
            {
                type: "text",
                text: `現在の参加者は\n${pro.displayName}さん\nです！`
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

}