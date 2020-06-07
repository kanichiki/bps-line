const parts = require("./constants/messageParts");

exports.main = async () => {
    return [
        {
            "type": "text",
            "text": "招待ありがとうございます$\n\n現在、このアカウントではワードウルフ、クレイジーノイジーで遊ぶことができます！\n\n$ゲーム参加者はこのアカウントを友達追加してください",
            "emojis":[
                {
                    "index":12,
                    "productId":"5ac21184040ab15980c9b43a",
                    "emojiId":"044"
                },
                {
                    "index":56,
                    "productId":"5ac21a18040ab15980c9b43e",
                    "emojiId":"048"
                }
            ]
        },
        {
            "type": "flex",
            "altText": "ゲーム一覧",
            "contents": await parts.gamesMessage()
        }
    ]
}