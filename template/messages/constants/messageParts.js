const mainColor = "#E83b10"

exports.mainColor = mainColor;

exports.voteMessage = async (displayNames,userIds) => {
    let voteMessages = [];
  
      // どうやら整数は送れないらしい
      for (let i = 0; i < userIds.length; i++) {
          const voteMessage = {
              "type": "bubble",
              "size": "micro",
              "body": {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                      {
                          "type": "button",
                          "action": {
                              "type": "postback",
                              "label": displayNames[i],
                              "data": userIds[i]
                          },
                          "color": mainColor
                      }
                  ]
              }
          }
  
          voteMessages.push(voteMessage);
      }
      return voteMessages;
}

exports.revoteMessage = async (displayNames,userIds,userIndexes) => {
    let voteMessages = [];
  
      // どうやら整数は送れないらしい
      for (let userIndex of userIndexes) {
          const voteMessage = {
              "type": "bubble",
              "size": "micro",
              "body": {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                      {
                          "type": "button",
                          "action": {
                              "type": "postback",
                              "label": displayNames[userIndex],
                              "data": userIds[userIndex]
                          },
                          "color": mainColor
                      }
                  ]
              }
          }
  
          voteMessages.push(voteMessage);
      }
      return voteMessages;
  }