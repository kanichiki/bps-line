exports.main = async (displayName) => {
    return [
        {
            type: "text",
            text: `${displayName}さんは別のゲームに参加中ですが、終了してこちらのゲームに参加しますか？\n参加する場合はもう一度「参加」と発言してください`
        }
    ]
}