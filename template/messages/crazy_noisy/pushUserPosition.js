const parts = require("../constants/messageParts");

exports.main = async (displayName,position) => {
    let reply = [];

    reply = [
        {
            type: "text",
            text: `${displayName}さんの役職は\n\n${position}\n\nです！`
        }
    ]

    return reply;
}