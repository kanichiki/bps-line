exports.main = async (genreName) => {
    return [
        {
            type: "text",
            text: `${genreName}が選ばれました！`
        },
        {
            "type": "flex",
            "altText": "This is a Flex Message",
            "contents": {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": "ウルフは1人でいいですよね？",
                            "size": "md"
                        }
                    ]
                },
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "button",
                            "action": {
                                "type": "message",
                                "label": "はい！",
                                "text": "はい！"
                            }
                        }
                    ]
                }
            }
        }
    ]
}