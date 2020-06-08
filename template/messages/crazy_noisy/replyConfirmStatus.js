const parts = require("../constants/messageParts");

exports.main = async (unconfirmed) => {
    
    const message = unconfirmed.join("さん、");

    return [
        {
            type: "text",
            text: `${message}さんは確認が済んでいません`
        }
    ]
}