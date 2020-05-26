const parts = require("../constants/messageParts");

exports.main = async (unvoted) => {
    
    const message = unvoted.join("さん、");

    return [
        {
            type: "text",
            text: `${message}さんは未投票です`
        }
    ]
}