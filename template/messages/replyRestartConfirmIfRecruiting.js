exports.main = async (recruitingGameName, newGameName) => {
    return [
        {
            type: "text",
            text: `${recruitingGameName}の参加者を募集中です。\n新しくゲームを始める場合はもう一度続けてゲーム名を発言してください。`
        }
    ]
}