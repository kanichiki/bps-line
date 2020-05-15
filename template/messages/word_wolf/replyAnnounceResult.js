const parts = require("../../constants/messageParts");

exports.main = async (displayNames, wolfIndexes, lunaticIndexes, citizenWord, wolfWord) => {
    let resultMessage = "それぞれの単語は以下の通りです\n\n";

    let result = [];
    for (let i = 0; i < displayNames.length; i++) {
        let word = ""
        if (wolfIndexes.indexOf(i) == -1) {
            if (lunaticIndexes.indexOf(i) == -1) {
                word = "・" + displayNames[i] + " : " + citizenWord;
            } else {
                word = "・" + displayNames[i] + " : " + citizenWord + " ←狂人";
            }
        } else {
            if (lunaticIndexes.indexOf(i) == -1) {
                word = "・" + displayNames[i] + " : " + wolfWord + " ←ウルフ";
            } else {
                word = "・" + displayNames[i] + " : " + wolfWord + " ←ウルフ&狂人";
            }
        }
        result.push(word);
    }

    const resultEnter = result.join("\n");
    resultMessage = resultMessage + resultEnter;

    return [
        {
            type: "text",
            text: resultMessage
        }
    ]
}