exports.main = async (voterDisplayName,executorDisplayName,isExecutorWolf) => {
    let message = "";
    if(!isExecutorWolf){
        message = "ウルフ側の勝利です！！"
    }else{
        message = "市民側の勝利です！！"
    }
    
    return [
        {
            type: "text",
            text: `${voterDisplayName}さん、投票完了しました！`
        },
        {
            type: "text",
            text: `${executorDisplayName}さんが処刑されました`
        },
        {
            type: "text",
            text: message
        }
    ]
}