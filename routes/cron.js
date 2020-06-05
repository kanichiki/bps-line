const line = require("@line/bot-sdk");
const config = {
    channelAccessToken: process.env.channelAccessToken,
    channelSecret: process.env.channelSecret
};
const client = new line.Client(config);

const CrazyNoisy = require("../classes/CrazyNoisy");
const WordWolf = require("../classes/WordWolf");
const ParticipantList = require("../classes/ParticipantList");
const commonFunction = require("../template/functions/commonFunction");

exports.crazyNoisyDiscussFinish = async () => {
    const pl = new ParticipantList();
    const plIds = await new CrazyNoisy(0).getDiscussingPlIds();
    for (let plId of plIds) {
        const isPlaying = await pl.isPlaying(plId);
        if (isPlaying) {
            const crazyNoisy = new CrazyNoisy(plId);
            const isOverTime = await crazyNoisy.isOverTime();
            if (isOverTime) {
                const groupId = await crazyNoisy.getGroupId();
                // DB変更操作１，２
                // 投票データを挿入出来たら話し合い終了ステータスをtrueにする同期処理
                await crazyNoisy.updateDiscussStatusFalse();
                await crazyNoisy.updateNotifyStatusFalse();

                const hasVote = await crazyNoisy.hasVote();
                if (!hasVote) { // 投票データ持ってなかったら
                    await crazyNoisy.createVote();
                } else {
                    await crazyNoisy.initializeVote();
                }
                await crazyNoisy.updateVoteStatusTrue();

                const userNumber = await crazyNoisy.getUserNumber();
                const shuffleUserIndexes = await commonFunction.makeShuffuleNumberArray(userNumber);

                let userIds = [];
                let displayNames = [];

                // 公平にするため投票用の順番はランダムにする
                for (let i = 0; i < userNumber; i++) {
                    userIds[i] = await crazyNoisy.getUserId(shuffleUserIndexes[i]);
                    displayNames[i] = await crazyNoisy.getDisplayName(shuffleUserIndexes[i])
                }


                //if (usePostback) { // postbackを使う設定の場合
                const pushMessage = require("../template/messages/crazy_noisy/replyDiscussFinish");

                // try {
                await client.pushMessage(groupId, await pushMessage.main(displayNames, userIds));
                // } catch{
                // console.log("failed to push message");
                // await pl.finishParticipantList(plId);
                // }
            }
        }
    }
}

exports.wordWolfDiscussFinish = async () => {
    const pl = new ParticipantList();
    const plIds = await new WordWolf(0).getDiscussingPlIds();
    for (let plId of plIds) {
        const isPlaying = await pl.isPlaying(plId);
        if (isPlaying) {
            const wordWolf = new WordWolf(plId);
            const isOverTime = await wordWolf.isOverTime();
            if (isOverTime) {
                const groupId = await pl.getGroupId(plId);

                // DB変更操作１，２
                // 投票データを挿入出来たら話し合い終了ステータスをtrueにする同期処理
                await wordWolf.createVote().then(wordWolf.updateStatus("vote"));

                const userNumber = await wordWolf.getUserNumber();
                const shuffleUserIndexes = await commonFunction.makeShuffuleNumberArray(userNumber);

                let userIds = [];
                let displayNames = [];

                // 公平にするため投票用の順番はランダムにする
                for (let i = 0; i < userNumber; i++) {
                    userIds[i] = await wordWolf.getUserId(shuffleUserIndexes[i]);
                    displayNames[i] = await wordWolf.getDisplayName(shuffleUserIndexes[i]);
                }


                //if (usePostback) { // postbackを使う設定の場合
                const pushMessage = require("../template/messages/word_wolf/replyFinish");

                try {
                    await client.pushMessage(groupId, await pushMessage.main(displayNames, userIds));
                } catch{
                    await pl.finishParticipantList(plId);
                }
            }
        }
    }
}