const parts = require("../constants/messageParts");

exports.main = async (displayNames,positions,contentsList) =>{
    let positionMessages = "役職一覧\n\n"
    let crazinessMessages = "狂気一覧\n"

    for (let i = 0; i < displayNames.length; i++) {
        let positionMessage = `・${displayNames[i]} : ${positions[i]}\n`;
        positionMessages += positionMessage;

        if(contentsList[i].length>0){
            let crazinessMessage = `\n・${displayNames[i]} : `;
            for(let j=0; j<contentsList[i].length;j++){
                crazinessMessage += `\n ${j+1}. ${contentsList[i][j]}`;
            }
            crazinessMessage += `\n`;
            crazinessMessages += crazinessMessage;
        }
        
    }

    return [
        {
            type: "text",
            text: positionMessages
        },
        {
            type: "text",
            text: crazinessMessages
        }
    ]
}