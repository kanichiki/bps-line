const parts = require("../constants/messageParts");

exports.main = async (userNumber,numberOption) => {
  let detectiveNumber = ""
  let citizenNumber = ""
  
  if(userNumber>6){
    detectiveNumber = "1";
    citizenNumber = `${userNumber-numberOption-2}~${userNumber-numberOption-1}`
  } else {
    detectiveNumber = `0~1`
    citizenNumber = `${userNumber-numberOption*2-1}~${userNumber-numberOption*2+1}`
  } 
  
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
                  "text": "各役職の人数は以下の通りです",
                  "size": "md",
                  "wrap": true
                },
                {
                  "type": "separator",
                  "margin": "md"
                },
                {
                  "type": "text",
                  "text": "教祖 : 1人",
                  "margin": "md"
                },
                {
                  "type": "text",
                  "text": `狂信者 : ${numberOption-1}~${numberOption}人`
                },
                {
                  "type": "text",
                  "text": `探偵 : ${detectiveNumber}人`
                },
                {
                  "type": "text",
                  "text": `市民 : ${citizenNumber}人`
                }
              ]
            }
          }
        }
    ]
}