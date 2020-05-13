const parts = require("../../constants/messageParts");

exports.main = async (displayName) => {
    return [
        {
            type: "text",
            text: `${displayName}さんは投票済みです`
        }
    ]
}