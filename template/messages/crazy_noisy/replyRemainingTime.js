const parts = require("../../constants/messageParts");

exports.main = async (remainingTime) => {
    return [
        {
            type: "text",
            text: `話し合いの残り時間は${remainingTime}です`
        }
    ]
}