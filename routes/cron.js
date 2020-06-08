const line = require("@line/bot-sdk");
const config = {
    channelAccessToken: process.env.channelAccessToken,
    channelSecret: process.env.channelSecret
};
const client = new line.Client(config);

const CrazyNoisy = require("../classes/CrazyNoisy");
const WordWolf = require("../classes/WordWolf");
const PlayingGame = require("../classes/PlayingGame");
const ParticipantList = require("../classes/ParticipantList");
const commonFunction = require("../template/functions/commonFunction");


exports.discussFinish = async () => {
    const plIds = await new PlayingGame(0).getDiscussingPlIds();
    for (let plId of plIds) {
        const isPlaying = await new ParticipantList().isPlaying(plId);
        if (isPlaying) {
            const playingGame = new PlayingGame(plId);
            const isOverTime = await playingGame.isOverTime();
            if (isOverTime) {
                const groupId = await playingGame.getGroupId();

                // DB変更操作１，２
                // 投票データを挿入出来たら話し合い終了ステータスをtrueにする同期処理
                await playingGame.createVote().then(playingGame.updateStatus("vote"));

                const userNumber = await playingGame.getUserNumber();
                const shuffleUserIndexes = await commonFunction.makeShuffuleNumberArray(userNumber);

                let userIds = [];
                let displayNames = [];

                // 公平にするため投票用の順番はランダムにする
                for (let i = 0; i < userNumber; i++) {
                    userIds[i] = await playingGame.getUserId(shuffleUserIndexes[i]);
                    displayNames[i] = await playingGame.getDisplayName(shuffleUserIndexes[i]);
                }


                //if (usePostback) { // postbackを使う設定の場合
                const gameId = await playingGame.getGameId();
                let pushMessage;
                if (gameId == 1) {
                    pushMessage = require("../template/messages/word_wolf/replyFinish");
                }
                if (gameId == 2) {
                    pushMessage = require("../template/messages/crazy_noisy/replyDiscussFinish");
                }

                try {
                    await client.pushMessage(groupId, await pushMessage.main(displayNames, userIds));
                } catch{
                    await playingGame.finishParticipantList();
                }
            }
        }
    }
}