const parts = require("../../constants/messageParts");

exports.main = async (displayNames, userNumber, recruitingGameName) => {
    const displayNamesSan = displayNames.join("さん、\n");

    return [
        {
            type: "text",
            text: `現在の参加者数は${userNumber}人です\nクレイジーノイジーを始めるには4人以上必要です`
        },
        {
            type: "text",
            text: `現在の参加者は\n\n${displayNamesSan}さん\n\nです！\n引き続き${recruitingGameName}の参加者を募集しています！`
        },
        {
            "type": "flex",
            "altText": "参加募集",
            "contents": {
                "type": "bubble",
                "footer": {
                    "type": "box",
                    "layout": "horizontal",
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
                            },
                            "color": parts.mainColor,
                            "style": "primary"
                        },
                        {
                            "type": "separator"
                        },
                        {
                            "type": "button",
                            "style": "link",
                            "height": "sm",
                            "action": {
                                "type": "message",
                                "label": "受付終了",
                                "text": "受付終了"
                            },
                            "color": parts.mainColor,
                            "style": "primary"
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