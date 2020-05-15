const parts = require("../../constants/messageParts");

exports.main = async (profile, userWord, isLunatic) => {
    let reply = [];

    if (!isLunatic) {
        reply = [
            {
                type: "text",
                text: `${profile}さんのワードは\n\n${userWord}\n\nです！`
            }
        ]
    }else{
        reply = [
            {
                type: "text",
                text: `あなたは「狂人」です。ただし、ウルフを兼ねている可能性もあるので気をつけてください\n${profile}さんのワードは\n\n${userWord}\n\nです！`
            }
        ]
    }
    return reply;
}