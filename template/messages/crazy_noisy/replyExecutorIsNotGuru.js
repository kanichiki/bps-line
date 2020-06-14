const parts = require("../constants/messageParts");

exports.main = async (executorDisplayName) => {
    return [
        {
            "type": "flex",
            "altText": "役職確認",
            "contents": {
                "type": "bubble",
                "body": {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "wrap": true,
                      "contents": [
                        {
                          "type": "span",
                          "text": executorDisplayName,
                          "color": parts.mainColor
                        },
                        {
                          "type": "span",
                          "text": "さんは教祖ではなかったようですが、拷問の結果気が狂ってしまいました"
                        }
                      ],
                      "size": "lg"
                    }
                  ]
                }
              }
        }
    ]
}