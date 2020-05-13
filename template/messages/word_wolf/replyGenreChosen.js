exports.main = async (genreName,wolfNumberOptions) => {
    let wolfNumberMessages = [];
    for (let wolfNumberOption of wolfNumberOptions) {
        const wolfNumberMessage = {
            "type": "button",
            "style": "link",
            "height": "sm",
            "action": {
              "type": "message",
              "label": `${wolfNumberOption}人`,
              "text": `${wolfNumberOption}人`
            },
            "color": "#E83b10"
          }
        wolfNumberMessages.push(wolfNumberMessage);
    }
    return [
        {
            type: "text",
            text: `${genreName}が選ばれました！`
        },
        {
            "type": "flex",
            "altText": "ウルフの人数候補",
            "contents": {
                "type": "bubble",
                "body": {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "text": "ウルフの人数を選んでください",
                      "weight": "bold",
                      "size": "md"
                    }
                  ]
                },
                "footer": {
                  "type": "box",
                  "layout": "vertical",
                  "spacing": "sm",
                  "contents": wolfNumberMessages,
                  "flex": 0
                }
              }
        }
    ]
}