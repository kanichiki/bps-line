const line = require("@line/bot-sdk");
const config = {
    channelAccessToken: process.env.channelAccessToken,
    channelSecret: process.env.channelSecret
};

const client = new line.Client(config);
const WordWolf = require("./WordWolf");
const PlayingGame = require("../PlayingGame");
const ParticipantList = require("../ParticipantList")

const commonFunction = require("../commonFunction");

/**
 * ワードウルフにおいて、人数が3人未満の状態で参加受付終了がコールされたときリプライする
 *
 * @param {*} plId
 * @param {*} replyToken
 * @returns
 */
exports.replyTooFewParticipant = async (plId, replyToken) => {
    const replyMessage = require("../../template/messages/word_wolf/replyTooFewParticipant.js");
    const pl = new ParticipantList();

    const displayNames = await pl.getDisplayNames(plId); // 参加者の表示名リスト
    const userNumber = await pl.getUserNumber(plId); // 参加者数

    const recruitingGame = new PlayingGame(plId);
    const recruitingGameName = await recruitingGame.getGameName();

    return client.replyMessage(replyToken, await replyMessage.main(displayNames, userNumber, recruitingGameName));
}

exports.replyGenreChosen = async (plId, genreId, replyToken) => {
    const message = require("../../template/messages/word_wolf/replyGenreChosen");

    const wordWolf = new WordWolf(plId);
    const genreName = await wordWolf.getGenreName(genreId);
    await wordWolf.createWordWolfSetting(genreId).then(wordWolf.updateGenreStatusTrue());

    const wolfNumberOptions = await wordWolf.getWolfNumberOptions()

    return client.replyMessage(replyToken, await message.main(genreName, wolfNumberOptions));
}


exports.replyWolfNumberChosen = async (plId, wolfNumber, replyToken) => {
    const message = require("../../template/messages/word_wolf/replyWolfNumberChosen");

    const wordWolf = new WordWolf(plId);

    //ウルフ番号データを挿入できたらステータスをtrueにする
    await wordWolf.updateWolfIndexes(wolfNumber).then(wordWolf.updateWolfNumberStatusTrue());

    const genreId = await wordWolf.getGenreId();
    const genreName = await wordWolf.getGenreName(genreId);

    return client.replyMessage(replyToken, await message.main(wolfNumber, genreName));
}

exports.replyConfirm = async (plId, replyToken) => {
    const replyMessage = require("../../template/messages/word_wolf/replyConfirm");
    const pushMessage = require("../../template/messages/word_wolf/pushUserWord");

    const wordWolf = new WordWolf(plId);
    await wordWolf.updateConfirmStatusTrue();
    // const profiles = await wordWolf.getDisplayNames();
    const wolfIndexes = await wordWolf.getWolfIndexes();
    const citizenWord = await wordWolf.getCitizenWord();
    const wolfWord = await wordWolf.getWolfWord();
    const userNumber = await wordWolf.getUserNumber();

    let userIds = [];
    let profiles = [];
    let userWords = [];
    for (let i = 0; i < userNumber; i++) {
        userIds[i] = await wordWolf.getUserId(i);
        const profile = await client.getProfile(userIds[i]);
        profiles[i] = profile.displayName;
        if (wolfIndexes.indexOf(i) == -1) {
            userWords[i] = citizenWord;
        } else {
            userWords[i] = wolfWord;
        }
    }
    console.log(profiles);

    for (let i = 0; i < userNumber; i++) {
        // プッシュメッセージ数節約のため開発時は一時的に無効化
        client.pushMessage(userIds[i], await pushMessage.main(profiles[i], userWords[i]))
    }

    return client.replyMessage(replyToken, await replyMessage.main());
}

exports.replyFinish = async (plId, replyToken) => {
    const replyMessage = require("../../template/messages/word_wolf/replyFinish");
    const wordWolf = new WordWolf(plId);

    // 投票データを挿入出来たら話し合い終了ステータスをtrueにする同期処理
    await wordWolf.createWordWolfVote().then(wordWolf.updateFinishedStatusTrue());

    const userNumber = await wordWolf.getUserNumber();
    const userIndexes = await commonFunction.makeShuffuleNumberArray(userNumber);

    let userIds = [];
    let profiles = [];

    // 公平にするため投票用の順番はランダムにする
    for (let i = 0; i < userNumber; i++) {
        userIds[i] = await wordWolf.getUserId(userIndexes[i]);
        const profile = await client.getProfile(userIds[i]);
        profiles[i] = profile.displayName;
    }

    return client.replyMessage(replyToken, await replyMessage.main(userIndexes, profiles));

}

exports.replyVoteSuccess = async (plId, replyToken, userIndex) => {
    const replyMessage = require("../../template/messages/word_wolf/replyVoteSuccess");
    const wordWolf = new WordWolf(plId);
    const displayNames = await wordWolf.getDisplayNames();
    const displayName = displayNames[userIndex];
    return client.replyMessage(replyToken, await replyMessage.main(displayName));
}

exports.replySelfVote = async (plId, replyToken, userIndex) => {
    const replyMessage = require("../../template/messages/word_wolf/replySelfVote");
    const wordWolf = new WordWolf(plId);
    const displayNames = await wordWolf.getDisplayNames();
    const displayName = displayNames[userIndex];
    return client.replyMessage(replyToken, await replyMessage.main(displayName));
}

exports.replyDuplicateVote = async (plId, replyToken, userIndex) => {
    const replyMessage = require("../../template/messages/word_wolf/replyDuplicateVote");
    const wordWolf = new WordWolf(plId);
    const displayNames = await wordWolf.getDisplayNames();
    const displayName = displayNames[userIndex];
    return client.replyMessage(replyToken, await replyMessage.main(displayName));
}
