const parts = require("../constants/messageParts");

exports.main = async (displayName,isGuru) => {
    let message = "";
    if(isGuru){
        message = "教祖でした"
    }else {
        message = "教祖ではありませんでした"
    }
    
    return [
        {
            type: "text",
            text: `調査の結果、${displayName}さんは${message}`
        }
    ]
}