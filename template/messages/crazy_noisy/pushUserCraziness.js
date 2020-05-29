const parts = require("../constants/messageParts");

exports.main = async (contents,remarks) => {
    let message = ""

    for(let i=0;i<contents.length;i++){
        if(remarks[i] != null){
        message = message + `・${contents[i]}\n  ${remarks[i]}\n`
        }else{
            message = message + `・${contents[i]}\n`
        }
    }

    return [
        {
            type: "text",
            text: `あなたの狂気は\n\n${message}\n以上です。\n狂気の内容を話すことはできません。`
        }
    ]
}