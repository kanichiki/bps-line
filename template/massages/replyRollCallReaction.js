exports.main = async (messageText, names) => {
    return [
        {
            type: "text",
            text: messageText
        },
        {
            type: "text",
            text: `現在の参加者は\n${names}さん\nです！`
        }
    ]
}