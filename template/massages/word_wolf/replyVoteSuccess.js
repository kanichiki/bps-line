exports.main = async (displayName) => {
    return [
        {
            type: "text",
            text: `${displayName}さん、投票完了しました！`
        }
    ]
}