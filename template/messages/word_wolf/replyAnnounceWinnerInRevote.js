const parts = require("../../constants/messageParts");

exports.main = async (voterDisplayName, executorDisplayName, isExecutorWolf,displayNames,isWinnerArray) => {
    let message = "";
    if (!isExecutorWolf) {
        message = "ウルフ側の勝利です！！"
    } else {
        message = "市民側の勝利です！！"
    }

    let winners = [];
    for(let i=0;i<displayNames.length;i++){
      if(isWinnerArray[i]){
        winners.push(displayNames[i]);
      }
    }
    const winnerMessage = winners.join("さん、");

    return [
        {
            type: "text",
            text: `${voterDisplayName}さん、投票完了しました！`
        },
        {
            type: "text",
            text: `得票数が並んだため、ランダムで${executorDisplayName}さんが処刑されました`
        },
        {
            "type": "flex",
            "altText": "再投票",
            "contents": {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": message,
                            "size": "lg",
                            "wrap": true,
                            "align": "center"
                        },
                        {
                          "type": "separator",
                          "margin": "md"
                        },
                        {
                          "type": "text",
                          "text": `勝者 : ${winnerMessage}さん`,
                          "margin": "md",
                          "wrap": true
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
                                "label": "ワードを見る",
                                "text": "ワードを見る"
                            }
                        }
                    ]
                }
            }
        }
    ]
}