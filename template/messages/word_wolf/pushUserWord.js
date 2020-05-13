exports.main = async (profile,userWord) => {
    return [
        {
            type: "text",
            text: `${profile}さんのワードは\n\n${userWord}\n\nです！`
        }
    ]
}