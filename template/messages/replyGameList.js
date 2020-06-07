const parts = require("./constants/messageParts");

exports.main = async () => {
    return [
        {
            "type": "flex",
            "altText": "ゲーム一覧",
            "contents": await parts.gamesMessage()
        }
    ]
}