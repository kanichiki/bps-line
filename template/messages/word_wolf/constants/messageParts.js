const parts = require("../../constants/messageParts");

exports.depthOptions = {
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
        "text": "1~3 : ",
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
        "text": "恋愛だけワード数が豊富なのでジャンルとして分かれてます",
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
          }
        ]
      },
      {
        "type": "separator"
      },
      {
        "type": "box",
        "layout": "horizontal",
        "contents": [
          {
            "type": "button",
            "action": {
              "type": "message",
              "label": "3",
              "text": "3"
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
              "label": "恋愛",
              "text": "5"
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

exports.wolfNumberMessage = async (wolfNumberOptions) => {
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
      "color": parts.mainColor
    }
    wolfNumberMessages.push(wolfNumberMessage);
  }

  return {
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

exports.lunaticNumberMessage = async (lunaticNumberOptions) => {
  let lunaticNumberMessages = [];
  for (let lunaticNumberOption of lunaticNumberOptions) {
    const lunaticNumberMessage = {
      "type": "button",
      "style": "link",
      "height": "sm",
      "action": {
        "type": "message",
        "label": `${lunaticNumberOption}人`,
        "text": `${lunaticNumberOption}人`
      },
      "color": parts.mainColor
    }
    lunaticNumberMessages.push(lunaticNumberMessage);
  }

  return {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "狂人の人数を選んでください",
          "weight": "bold",
          "size": "md"
        },
        {
          "type": "separator",
          "margin": "sm"
        },
        {
          "type": "text",
          "text": "狂人はウルフ側が勝利した場合(ウルフ以外が処刑された場合)に勝利となります。ただし、ウルフが狂人を兼ねる場合もあります。狂人にはワードが配られる際に狂人であることが告げられます。",
          "weight": "bold",
          "size": "sm",
          "wrap": true
        },
      ]
    },
    "footer": {
      "type": "box",
      "layout": "vertical",
      "spacing": "sm",
      "contents": lunaticNumberMessages,
      "flex": 0
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

exports.settingConfirmMessage = async (userNumber, depth, wolfNumber, lunaticNumber, timer) => {
  if(depth == 5){
    depth = "恋愛"
  }
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
              "text": `難易度 : ${depth}`,
              "size": "lg"
            },
            {
              "type": "text",
              "text": `ウルフ : ${wolfNumber}人`,
              "size": "lg"
            },
            {
              "type": "text",
              "text": `狂人 : ${lunaticNumber}人`,
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
                "label": "難易度変更",
                "text": "難易度変更"
              },
              "color": parts.mainColor
            },
            {
              "type": "button",
              "action": {
                "type": "message",
                "label": "ウルフ人数変更",
                "text": "ウルフ人数変更"
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
                "label": "議論時間変更",
                "text": "議論時間変更"
              },
              "color": parts.mainColor
            },
            {
              "type": "button",
              "action": {
                "type": "message",
                "label": "狂人人数変更",
                "text": "狂人人数変更"
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

