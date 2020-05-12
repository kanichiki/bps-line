exports.main = async (displayNames, genres) => {

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
                        }
                    }
                ]
            }
        }
        genreMessages.push(genreMessage);
    }

    const displayNamesSan = displayNames.join("さん、\n");

    return [
        {
            type: "text",
            text: `参加受付を終了します`
        },
        {
            type: "text",
            text: `参加者は\n\n${displayNamesSan}さん\n\nです！`
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