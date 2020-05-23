const parts = require("../../constants/messageParts");

exports.main = async (day) => {
    return [
        {
            type: "text",
            text: `${day}日目の朝になりました`
        }
    ]
}