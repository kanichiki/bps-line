const parts = require("../../constants/messageParts");

exports.main = async (wolfNumber, lunaticNumberOptions) => {
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
  return [
    {
      type: "text",
      text: `ウルフは${wolfNumber}人ですね！`
    },
    {
      "type": "flex",
      "altText": "狂人の人数候補",
      "contents": {
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
  ]
}