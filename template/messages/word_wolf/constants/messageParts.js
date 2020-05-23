const parts = require("../../../constants/messageParts");

module.exports = {
    depthOptions : {
        "type": "bubble",
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "ワードの難易度を選んでください！",
              "size": "md",
              "wrap": true,
              "weight": "bold",
              "margin": "none"
            },
            {
              "type": "separator",
              "margin": "md"
            },
            {
              "type": "text",
              "text": "1~4 : ",
              "wrap": true,
              "size": "sm"
            },
            {
              "type": "text",
              "text": "対抗ワードの予想しやすさで難易度付け",
              "wrap": true,
              "size": "sm"
            },
            {
              "type": "text",
              "text": "5：恋愛",
              "size": "sm",
              "wrap": true,
              "margin": "md"
            },
            {
              "type": "separator"
            }
          ],
          "spacing": "xs",
          "margin": "none"
        },
        "footer": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "button",
                  "action": {
                    "type": "message",
                    "label": "1",
                    "text": "1"
                  },
                  "color":parts.mainColor
                },
                {
                  "type": "separator"
                },
                {
                  "type": "button",
                  "action": {
                    "type": "message",
                    "label": "2",
                    "text": "2"
                  },
                  "color":parts.mainColor
                },
                {
                  "type": "separator"
                },
                {
                  "type": "button",
                  "action": {
                    "type": "message",
                    "label": "3",
                    "text": "3"
                  },
                  "color":parts.mainColor
                }
              ]
            },
            {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "button",
                  "action": {
                    "type": "message",
                    "label": "4",
                    "text": "4"
                  },
                  "color":mainColor
                },
                {
                  "type": "separator"
                },
                {
                  "type": "button",
                  "action": {
                    "type": "message",
                    "label": "5",
                    "text": "5"
                  },
                  "color":mainColor
                }
              ]
            }
          ]
        },
        "styles": {
          "body": {
            "separator": true
          }
        }
      }
}