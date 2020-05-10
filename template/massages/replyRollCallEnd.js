exports.main = async (names, genres) => {

    let genreMassages = [];
    for (let id in genres) {
        const genreMassage = {
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
        genreMassages.push(genreMassage);
    }

    return [
        {
            type: "text",
            text: `参加受付を終了します`
        },
        {
            type: "text",
            text: `参加者は\n${names}さん\nです！`
        },
        {
            type: "text",
            text: `ワードのジャンルを選んでください`
        },
        {
            "type": "flex",
            "altText": "This is a Flex Message",
            "contents": {
                "type": "carousel",
                "contents": genreMassages
            }
        }
    ]

}