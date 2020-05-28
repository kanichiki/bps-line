const parts = require("../constants/messageParts");

exports.main = async (displayName) => {
    return [
        {
            type: "text",
            text: `${displayName}さんを洗脳します`
        }
    ]
}