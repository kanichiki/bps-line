exports.main = async (profile,userWord) => {
    return [
        {
            type: "text",
            text: `${profile}さんの単語は\n\n${userWord}\n\nです！`
        }
    ]
}