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
                        "color": "#E83b10",
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