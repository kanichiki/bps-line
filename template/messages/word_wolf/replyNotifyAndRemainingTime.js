const parts = require("../../constants/messageParts");

exports.main = async (remainingTime) => {
    return [
        {
            type: "text",
            text: `話し合いの残り時間は${remainingTime}です`
        },
        {
            type: "text",
            text: `残り1分を切っています！`
        },
        {
            "type": "flex",
            "altText": "残り時間",
            "contents": {
                "type": "bubble",
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "button",
                            "action": {
                                "type": "postback",
                                "data": "残り時間",
                                "label": "残り時間"
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