const line = require("@line/bot-sdk");
const config = {
    channelAccessToken: process.env.channelAccessToken,
    channelSecret: process.env.channelSecret
};

const client = new line.Client(config);
const WordWolf = require("./WordWolf");

const commonFunction = require("../commonFunction");

exports.replyChooseGenre = async (plId, genreId, replyToken) => {
    const message = require("../../template/massages/word_wolf/replyChooseGenre");

    const wordWolf = new WordWolf(plId);
    const genreName = await wordWolf.readGenreName(genreId);
    wordWolf.createWordWolfSetting(genreId).then(wordWolf.updateGenreStatusTrue());


    return client.replyMessage(replyToken, await message.main(genreName));
}


exports.replyChooseWolfNumber = async (plId, wolfNumber, replyToken) => {
    const message = require("../../template/massages/word_wolf/replyChooseWolfNumber");

    const wordWolf = new WordWolf(plId);
    
    //ウルフ番号データを挿入できたらステータスをtrueにする
    wordWolf.updateWolfIndexes(wolfNumber).then(wordWolf.updateWolfNumberStatusTrue());

    const genreId = await wordWolf.readGenreId();
    const genreName = await wordWolf.readGenreName(genreId);

    return client.replyMessage(replyToken, await message.main(wolfNumber, genreName));
}

exports.replyConfirm = async (plId,replyToken) => {
    const replyMessage = require("../../template/massages/word_wolf/replyConfirm");
    const pushMessage = require("../../template/massages/word_wolf/pushUserWord");

    const wordWolf = new WordWolf(plId);
    wordWolf.updateConfirmStatusTrue();
    // const profiles = await wordWolf.readDisplayNames();
    const wolfIndexes = await wordWolf.readWolfIndexes();
    const citizenWord = await wordWolf.readCitizenWord();
    const wolfWord = await wordWolf.readWolfWord();
    const userNumber = await wordWolf.countUserNumber();

    let userIds = [];
    let profiles = [];
    let userWords = [];
    for(let i=0;i<userNumber;i++){
        userIds[i] = await wordWolf.readUserId(i);
        const profile = await client.getProfile(userIds[i]);
        profiles[i] = profile.displayName;
        if(wolfIndexes.indexOf(i) == -1){
            userWords[i] = citizenWord;
        }else{
            userWords[i] = wolfWord;
        }
    }
    console.log(profiles);

    for(let i=0;i<userNumber;i++){
        // プッシュメッセージ数節約のため開発時は一時的に無効化
        client.pushMessage(userIds[i],await pushMessage.main(profiles[i],userWords[i]))
    }

    return client.replyMessage(replyToken, await replyMessage.main());
}

exports.replyFinish = async (plId,replyToken) => {
    const replyMessage = require("../../template/massages/word_wolf/replyFinish");
    const wordWolf = new WordWolf(plId);

    // 投票データを挿入出来たら話し合い終了ステータスをtrueにする非同期処理
    wordWolf.createWordWolfVote().then(wordWolf.updateFinishedStatusTrue());

    const userNumber = await wordWolf.countUserNumber();
    const userIndexes = await commonFunction.makeShuffuleNumberArray(userNumber);

    let userIds = [];
    let profiles = [];

    // 公平にするため投票用の順番はランダムにする
    for(let i=0;i<userNumber;i++){
        userIds[i] = await wordWolf.readUserId(userIndexes[i]);
        const profile = await client.getProfile(userIds[i]);
        profiles[i] = profile.displayName;
    }

    return client.replyMessage(replyToken, await replyMessage.main(userIndexes,profiles));

}

exports.replyVoteSuccess = async (plId,replyToken,userIndex) => {
    const replyMessage = require("../../template/massages/word_wolf/replyVoteSuccess");
    const wordWolf = new WordWolf(plId);
    const displayNames = await wordWolf.readDisplayNames();
    const displayName = displayNames[userIndex];
    return client.replyMessage(replyToken, await replyMessage.main(displayName));
}

exports.replySelfVote = async (plId,replyToken,userIndex) => {
    const replyMessage = require("../../template/massages/word_wolf/replySelfVote");
    const wordWolf = new WordWolf(plId);
    const displayNames = await wordWolf.readDisplayNames();
    const displayName = displayNames[userIndex];
    return client.replyMessage(replyToken, await replyMessage.main(displayName));
}

exports.replyDuplicateVote = async (plId,replyToken,userIndex) => {
    const replyMessage = require("../../template/massages/word_wolf/replyDuplicateVote");
    const wordWolf = new WordWolf(plId);
    const displayNames = await wordWolf.readDisplayNames();
    const displayName = displayNames[userIndex];
    return client.replyMessage(replyToken, await replyMessage.main(displayName));
}
