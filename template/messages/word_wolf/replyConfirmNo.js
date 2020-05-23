const parts = require("../../constants/messageParts");
const wordWolfParts = require("./constants/messageParts");

/* ジャンル
exports.main = async (genres) => {

    let genreMessages = [];
    for (let id in genres) {
        const genreMessage = {
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "button",
                        "action": {
                            "type": "message",
                            "label": genres[id],
                            "text": genres[id]
                        },
                        "color": parts.mainColor,
                        "style": "link"
                    }
                ]
            }
        }
        genreMessages.push(genreMessage);
    }

    return [
        {
            type: "text",
            text: `お手数ですが、設定を最初からやり直してください`
        },
        {
            type: "text",
            text: `ワードのジャンルを選んでください`
        },
        {
            "type": "flex",
            "altText": "ワードのジャンル候補",
            "contents": {
                "type": "carousel",
                "contents": genreMessages
            }
        }
    ]
}
*/

// depth
exports.main = async (depths) => {

    /*
    let depthMessages = [];
    for (let depth in depths) {
        const depthMessage = {
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "button",
                        "action": {
                            "type": "message",
                            "label": depth,
                            "text": depth
                        },
                        "color": parts.mainColor,
                        "style": "link"
                    }
                ]
            }
        }
        depthMessages.push(depthMessage);
    }
    */

    return [
        {
            type: "text",
            text: `お手数ですが、設定を最初からやり直してください`
        },
        {
            "type": "flex",
            "altText": "ワードの難易度",
            "contents": wordWolfParts.depthOptions
        }
    ]
}