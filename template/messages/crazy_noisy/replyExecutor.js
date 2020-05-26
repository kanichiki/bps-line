const parts = require("../constants/messageParts");

exports.main = async (executorDisplayName) => {
    return [
        {
            type: "text",
            text: `${executorDisplayName}さんが拷問にかけられました`
        }
    ]
}