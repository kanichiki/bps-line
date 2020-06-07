const parts = require("../../constants/messageParts");



exports.guru = "教祖"
exports.fanatic = "狂信者"
exports.detective = "探偵"
exports.citizen = "市民"
exports.typeOptions = {
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
}

exports.modeOptions = {
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
            "color": parts.mainColor
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
}


exports.settingConfirmMessage = async (userNumber, mode, type, timer) => {
  return {
    "type": "bubble",
    "size": "giga",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "以下の内容でよろしいですか？",
              "size": "md",
              "wrap": true
            }
          ]
        },
        {
          "type": "separator",
          "margin": "md"
        },
        {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "spacer"
            },
            {
              "type": "text",
              "text": `参加者 : ${userNumber}人`,
              "size": "lg"
            },
            {
              "type": "text",
              "text": `モード : ${mode}`,
              "size": "lg"
            },
            {
              "type": "text",
              "text": `話し合い方法 : ${type}`,
              "size": "lg"
            },
            {
              "type": "text",
              "text": `議論時間 : ${timer}`,
              "size": "lg"
            }
          ],
          "margin": "md"
        },
        {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "button",
              "action": {
                "type": "message",
                "label": "モード変更",
                "text": "モード変更"
              },
              "color": parts.mainColor
            },
            {
              "type": "button",
              "action": {
                "type": "message",
                "label": "議論時間変更",
                "text": "議論時間変更"
              },
              "color": parts.mainColor
            }
          ],
          "margin": "md"
        },
        {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "button",
              "action": {
                "type": "message",
                "label": "話し合い方法変更",
                "text": "話し合い方法変更"
              },
              "color": parts.mainColor
            }
          ]
        },
        {
          "type": "separator",
          "margin": "md"
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "horizontal",
      "spacing": "sm",
      "contents": [
        {
          "type": "button",
          "style": "primary",
          "height": "sm",
          "action": {
            "type": "message",
            "label": "ゲームを開始する",
            "text": "ゲームを開始する"
          },
          "color": parts.mainColor
        }
      ]
    },
    "styles": {
      "footer": {
        "separator": true
      }
    }
  }
}

exports.timerMessage = async () => {
  return {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "議論時間を選択してください",
          "weight": "bold",
          "size": "md"
        },
        {
          "type": "text",
          "text": "※「時」が分に、「分」が秒に対応してます。例えば、「午後3時20分」を選択した場合、議論時間は「15分20秒」になります。わかりにくくて申し訳ないです...",
          "wrap": true,
          "size": "sm",
          "margin": "md"
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "vertical",
      "spacing": "sm",
      "contents": [
        {
          "type": "button",
          "style": "link",
          "height": "sm",
          "action": {
            "type": "datetimepicker",
            "label": "議論時間設定",
            "mode": "time",
            "data": "timer",
            "initial": "05:00",
            "max": "23:59",
            "min": "00:01"
          },
          color : parts.mainColor
        }
      ],
      "flex": 0
    }
  }
}