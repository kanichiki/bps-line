const parts = require("../constants/messageParts");

exports.main = async (executorDisplayName) => {
    return [
        {
            type: "text",
            text: `${executorDisplayName}さんは教祖ではなかったようですが、拷問の結果気が狂ってしまいました`
        }
    ]
}