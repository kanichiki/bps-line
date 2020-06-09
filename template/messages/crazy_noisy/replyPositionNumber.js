const parts = require("../constants/messageParts");
const crazyNoisyParts = require("./constants/messageParts");

exports.main = async (userNumber, numberOption) => {

    return [
        {
            "type": "flex",
            "altText": "役職人数確認",
            "contents": await crazyNoisyParts.positionNumberMessage(userNumber, numberOption)
        }
    ]
}