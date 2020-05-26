const parts = require("./constants/messageParts");

exports.main = async () => {
    return [
        {
            type: "text",
            text: `同じ名前の参加者が存在します。\nお手数ですが、表示名を変更して再度参加お願いします。`
        }
    ]
}