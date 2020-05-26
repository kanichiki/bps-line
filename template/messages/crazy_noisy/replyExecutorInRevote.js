const parts = require("../constants/messageParts");

exports.main = async (executorDisplayName) => {
    return [
        {
            type: "text",
            text: `得票数が並んだため、ランダムで${executorDisplayName}さんが拷問にかけられました`
        }
    ]
}