const parts = require("../../constants/messageParts");


module.exports = {
  guru: "教祖",
  fanatic: "狂信者",
  detective: "探偵",
  citizen: "市民",
  typeOptions: {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "話し合いの方法を選んでください！",
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
          "text": "1：チャット(LINE)を使う",
          "wrap": true,
          "size": "sm"
        },
        {
          "type": "text",
          "text": "2：通話(音声のみ)を使う",
          "wrap": true,
          "size": "sm"
        },
        {
          "type": "text",
          "text": "3：ビデオ通話を使う",
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
              "color": parts.mainColor
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
              "color": parts.mainColor
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
              "color": parts.mainColor
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
  },
  modeOptions : {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "モードを選んでください！",
          "size": "md",
          "wrap": true,
          "weight": "bold",
          "margin": "none"
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
                "label": "ノーマル",
                "text": "ノーマル"
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
                "label": "デモ",
                "text": "デモ"
              },
              "color":parts.mainColor
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