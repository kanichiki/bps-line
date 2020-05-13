exports.main = async (displayNames, wolfIndexes, citizenWord, wolfWord) => {
    let resultMessage = "それぞれの単語は以下の通りです\n\n";

    let result = [];
    for (let i = 0; i < displayNames.length; i++) {
        let word = ""
        if (wolfIndexes.indexOf(i) == -1) {
            word = "・" + displayNames[i] + " : " + citizenWord;
        } else {
            word = "・" + displayNames[i] + " : " + wolfWord + " ←ウルフ";
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