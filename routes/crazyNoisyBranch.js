const line = require("@line/bot-sdk");
const config = {
    channelAccessToken: process.env.channelAccessToken,
    channelSecret: process.env.channelSecret
};

const client = new line.Client(config);
const CrazyNoisy = require("../classes/CrazyNoisy");
const PlayingGame = require("../classes/PlayingGame");
const ParticipantList = require("../classes/ParticipantList")

const commonFunction = require("../template/functions/commonFunction");

/**
 * クレイジーノイジーの参加者が募集中の場合に点呼終了コールされたときの分岐
 *
 * @param {*} plId
 * @param {*} replyToken
 * @param {*} promises
 */
exports.rollCallBranch = async (plId, replyToken, promises) => {
    const pl = new ParticipantList();
    const userNumber = await pl.getUserNumber(plId); // 
    if (userNumber < 2) { // 参加者数が3人以下の場合(開発時はテストのため2人)
        await promises.push(replyTooFewParticipant(plId, replyToken));
    } else {
        // 参加受付終了の意思表明に対するリプライ
        // 参加受付を終了した旨（TODO 参加者を変更したい場合はもう一度「参加者が」ゲーム名を発言するように言う）、参加者のリスト、該当ゲームの最初の設定のメッセージを送る
        await promises.push(replyRollCallEnd(plId, replyToken));
    }
}

/**
 * eventがメッセージかつクレイジーノイジーがプレイ中で参加者の発言だった場合の分岐
 *
 * @param {*} plId
 * @param {*} text
 * @param {*} replyToken
 * @param {*} promises
 */
exports.playingMessageBranch = async (plId, text, replyToken, promises) => {
    const crazyNoisy = new CrazyNoisy(plId);

    const modeStatus = await crazyNoisy.getModeStatus();
    if (!modeStatus) { // モードが選択されていなかった場合
        if (text == "ノーマル" || text == "デモ") {
            await promises.push(replyModeChosen(plId, text, replyToken));
        }
    } else {

        const typeStatus = await crazyNoisy.getTypeStatus();
        if (!typeStatus) { // 話し合い方法が選択されていなかった場合
            if ((text == 1 || text == 2) || text == 3) {
                // if(text == 1 || text == 2){
                await promises.push(replyTypeChosen(plId, text, replyToken));
            }
        } else {
            const settingConfirmStatus = await crazyNoisy.getSettingConfirmStatus();
            if (!settingConfirmStatus) {
                if (text == "はい") {
                    await promises.push(replyConfirmYes(plId, replyToken));
                }
                if (text == "いいえ") {
                    await promises.push(replyConfirmNo(plId, replyToken));
                }
            } else { // 設定が完了していた場合
                const discussStatus = await crazyNoisy.getDiscussStatus();
                if (discussStatus) { // 話し合い中だった場合
                    if (text == "終了") {
                        await promises.push(replyDiscussFinish(plId, replyToken));
                    } else { // 発言が終了以外の場合
                        const isOverTime = await crazyNoisy.isOverTime();
                        if (isOverTime) { // 話し合い時間が終了していた場合
                            await promises.push(replyDiscussFinish(plId, replyToken));

                        } else {
                            if (text == "残り時間") {
                                const isRemainingTimeLessThan1minute = await crazyNoisy.isRemainingTimeLessThan1minute();
                                if (isRemainingTimeLessThan1minute) { // 話し合い時間が1分を切っていた場合

                                    const notifyStatus = await crazyNoisy.getNotifyStatus();
                                    if (!notifyStatus) { // 残り1分をまだ通知していなかった場合
                                        await promises.push(replyNotifyAndRemainingTime(plId, replyToken));
                                    } else {
                                        await promises.push(replyRemainingTime(plId, replyToken));
                                    }
                                } else { // 残り1分切ってなかったら

                                    await promises.push(replyRemainingTime(plId, replyToken));
                                }
                            }

                            const isRemainingTimeLessThan1minute = await crazyNoisy.isRemainingTimeLessThan1minute();
                            if (isRemainingTimeLessThan1minute) { // 話し合い時間が1分を切っていた場合

                                const notifyStatus = await crazyNoisy.getNotifyStatus();
                                if (!notifyStatus) { // 残り1分をまだ通知していなかった場合
                                    await promises.push(replyNotify(plId, replyToken));
                                }
                            }

                        }
                    }
                }

                const winnerStatus = await crazyNoisy.getWinnerStatus();
                if (winnerStatus) {
                    const resultStatus = await crazyNoisy.getResultStatus();
                    if (!resultStatus) { // まだ結果発表してなかったら
                        if (text == "役職・狂気を見る") {
                            await promises.push(replyResult(plId, replyToken));
                        }
                    }
                }
            }
        }
    }

}


/**
 * eventがpostbackかつクレイジーノイジーがプレイ中で参加者のポストバックイベントだった場合の分岐
 *
 * @param {*} plId
 * @param {*} userId
 * @param {*} postbackData
 * @param {*} replyToken
 * @param {*} promises
 */
exports.postbackPlayingBranch = async (plId, userId, postbackData, replyToken, promises) => {
    const crazyNoisy = new CrazyNoisy(plId);

    const isConfirmsCompleted = await crazyNoisy.isConfirmsCompleted();
    if (!isConfirmsCompleted) { // まだ役職確認が済んでいなかったら
        if (postbackData == "確認") {
            await promises.push(replyPositionConfirm(plId, userId, replyToken));
        }

    } else { // 役職確認済み

        const voteStatus = await crazyNoisy.getVoteStatus();
        if (voteStatus) { // 投票中だった場合

            const userIndex = await crazyNoisy.getUserIndexFromUserId(userId);
            const voteState = await crazyNoisy.isVotedUser(userIndex);
            if (!voteState) { // postbackした参加者の投票がまだの場合

                const isRevoting = await crazyNoisy.hasRevote();
                if (!isRevoting) { // １回目の投票中だった場合

                    const isPostbackParticipant = await crazyNoisy.isUserParticipant(postbackData);
                    if (isPostbackParticipant) { // postbackのデータが参加者のインデックスだった場合

                        // この中は下の※と同じになるように
                        if (userId != postbackData) { // 自分以外に投票していた場合
                            await promises.push(replyVoteSuccess(plId, postbackData, replyToken, userIndex));

                        } else { // 自分に投票していた場合
                            await promises.push(replySelfVote(plId, replyToken, userIndex));
                        }
                    }

                } else { // 再投票中だった場合 
                    const votedUserIndex = await crazyNoisy.getUserIndexFromUserId(postbackData);
                    const isRevoteCandidateIndex = await crazyNoisy.isRevoteCandidateIndex(votedUserIndex);
                    if (isRevoteCandidateIndex) { // postbackのデータが再投票の候補者のインデックスだった場合

                        // ※
                        if (userId != postbackData) { // 自分以外に投票していた場合
                            await promises.push(replyVoteSuccess(plId, postbackData, replyToken, userIndex));

                        } else { // 自分に投票していた場合
                            await promises.push(replySelfVote(plId, replyToken, userIndex));
                        }
                    }
                }


            } else {
                await promises.push(replyDuplicateVote(plId, replyToken, userIndex));
            }
        }

        const discussStatus = await crazyNoisy.getDiscussStatus();
        if (discussStatus) {

            const isOverTime = await crazyNoisy.isOverTime();
            if (isOverTime) { // 話し合い時間が終了していた場合
                await promises.push(replyDiscussFinish(plId, replyToken));

            } else {
                if (postbackData == "残り時間") {
                    const isRemainingTimeLessThan1minute = await crazyNoisy.isRemainingTimeLessThan1minute();
                    if (isRemainingTimeLessThan1minute) { // 話し合い時間が1分を切っていた場合

                        const notifyStatus = await crazyNoisy.getNotifyStatus();
                        if (!notifyStatus) { // 残り1分をまだ通知していなかった場合
                            await promises.push(replyNotifyAndRemainingTime(plId, replyToken));
                        } else {
                            await promises.push(replyRemainingTime(plId, replyToken));
                        }
                    } else {
                        await promises.push(replyRemainingTime(plId, replyToken));
                    }
                }
            }
        }
    }
}

/**
 * 個人でpostbackがきたときの分岐
 *
 * @param {*} plId
 * @param {*} userId
 * @param {*} postbackData
 * @param {*} replyToken
 * @param {*} promises
 */
exports.postbackUserBranch = async (plId, userId, postbackData, replyToken, promises) => {
    const crazyNoisy = new CrazyNoisy(plId);

    const actionStatus = await crazyNoisy.getActionStatus();
    if (actionStatus) { // 夜のアクション中なら

        const userIndex = await crazyNoisy.getUserIndexFromUserId(userId);
        const actionsState = await crazyNoisy.getActionsState(userIndex);
        if (!actionsState) { // その人のアクションがまだなら

            const postbackDataExists = await crazyNoisy.actionTargetUserIdExists(userIndex, postbackData);
            if (postbackDataExists) {
                const targetUserIndex = await crazyNoisy.getUserIndexFromUserId(postbackData);
                const position = await crazyNoisy.getPosition(userIndex);
                if (position == crazyNoisy.guru) {
                    await promises.push(replyGuruAction(plId, userIndex, targetUserIndex, replyToken));
                }
                if (position == crazyNoisy.detective) {
                    await promises.push(replyDetectiveAction(plId, userIndex, targetUserIndex, replyToken));
                }
            }
        }
    }
}


/**
 * クレイジーノイジーにおいて、人数が3人未満の状態で参加受付終了がコールされたときリプライする
 *
 * @param {*} plId
 * @param {*} replyToken
 * @returns
 */
const replyTooFewParticipant = async (plId, replyToken) => {
    const replyMessage = require("../template/messages/crazy_noisy/replyTooFewParticipant.js");
    const pl = new ParticipantList();

    const displayNames = await pl.getDisplayNames(plId); // 参加者の表示名リスト
    const userNumber = await pl.getUserNumber(plId); // 参加者数

    const recruitingGame = new PlayingGame(plId);
    const recruitingGameName = await recruitingGame.getGameName();

    return client.replyMessage(replyToken, await replyMessage.main(displayNames, userNumber, recruitingGameName));
}

/**
 * 参加受付終了に対するリプライ
 * 
 * DB変更操作は以下の通り
 * １．参加者リストをプレイ中にして、募集中を解除する
 * ２．ゲームの進行状況のテーブルにデータを挿入（まだなかった場合。確認をNoで帰ってくるパターンもある）
 *
 * @param {*} plId
 * @param {*} replyToken
 * @returns
 */
const replyRollCallEnd = async (plId, replyToken) => {
    const replyMessage = require("../template/messages/crazy_noisy/replyRollCallEnd");
    const pl = new ParticipantList();

    const displayNames = await pl.getDisplayNames(plId); // 参加者の表示名リスト

    // DB変更操作１
    await pl.updateIsPlayingTrue(plId).then(await pl.updateIsRecruitingFalse(plId)); // 参加者リストをプレイ中にして、募集中を解除する

    // DB変更操作２
    const crazyNoisy = new CrazyNoisy(plId);
    const hasStatus = await crazyNoisy.hasStatus(); // ステータスデータがあるかどうか

    if (!hasStatus) {
        await crazyNoisy.createStatus(); // クレイジーノイジーのゲーム進行状況データを作成
    }

    await crazyNoisy.createSetting(); // 設定データつくっとこ


    return client.replyMessage(replyToken, await replyMessage.main(displayNames));
}

const replyModeChosen = async (plId, text, replyToken) => {
    const replyMessage = require("../template/messages/crazy_noisy/replyModeChosen");
    const crazyNoisy = new CrazyNoisy(plId);

    await crazyNoisy.updateMode(text);
    await crazyNoisy.updateModeStatusTrue();

    return client.replyMessage(replyToken, await replyMessage.main(text));
}

const replyTypeChosen = async (plId, text, replyToken) => {
    const replyMessage = require("../template/messages/crazy_noisy/replyTypeChosen");
    const crazyNoisy = new CrazyNoisy(plId);

    await crazyNoisy.updateType(text);
    await crazyNoisy.updateTypeStatusTrue();
    const mode = await crazyNoisy.getMode();

    return client.replyMessage(replyToken, await replyMessage.main(mode, text));
}

const replyConfirmNo = async (plId, replyToken) => {
    const replyMessage = require("../template/messages/crazy_noisy/replyConfirmNo");
    const crazyNoisy = new CrazyNoisy(plId);

    await crazyNoisy.resetSetting();
    return client.replyMessage(replyToken, await replyMessage.main());
}

/**
 * 設定確認がyesだったときのリプライ
 *
 * @param {*} plId
 * @param {*} replyToken
 * @returns
 */
const replyConfirmYes = async (plId, replyToken) => {
    const replyMessage = require("../template/messages/crazy_noisy/replyConfirmYes");
    const pushPosition = require("../template/messages/crazy_noisy/pushUserPosition");
    const pushCraziness = require("../template/messages/crazy_noisy/pushUserCraziness")

    const pl = new ParticipantList();
    const crazyNoisy = new CrazyNoisy(plId);
    await crazyNoisy.updateConfirmStatusTrue();

    await crazyNoisy.updatePositions();
    const mode = await crazyNoisy.getMode();

    if (mode != "デモ") {
        await crazyNoisy.updateDefaultCrazinessIds();
    } else {
        await crazyNoisy.updateDefaultCrazinessIdsInDemo();
    }
    await crazyNoisy.updateBrainwashStatus();
    await crazyNoisy.updateConfirmsStatus();

    const userIds = await pl.getUserIds(plId);
    const displayNames = await pl.getDisplayNames(plId);
    const positions = await crazyNoisy.getPositions();
    const userNumber = await crazyNoisy.getUserNumber();
    const crazinessIds = await crazyNoisy.getCrazinessIds();

    for (let i = 0; i < userNumber; i++) {
        await client.pushMessage(userIds[i], await pushPosition.main(displayNames[i], positions[i]));
        if (crazinessIds[i][0] != null) {
            let contents = [];
            let remarks = [];
            for (let crazinessId of crazinessIds[i]) {
                if (crazinessId != null) {
                    const content = await crazyNoisy.getCrazinessContent(crazinessId);
                    const remark = await crazyNoisy.getCrazinessRemark(crazinessId);
                    contents.push(content);
                    remarks.push(remark);
                } else {
                    break; // 詰めて入ってるので抜ける
                }
            }
            console.log(contents);
            await client.pushMessage(userIds[i], await pushCraziness.main(contents, remarks));
        }
    }

    const numberOption = Math.floor((userNumber - 1) / 3);

    return client.replyMessage(replyToken, await replyMessage.main(userNumber, numberOption));
}

const replyPositionConfirm = async (plId, userId, replyToken) => {
    const pl = new ParticipantList();
    const crazyNoisy = new CrazyNoisy(plId);

    const userIndex = await pl.getUserIndexFromUserId(plId, userId);
    await crazyNoisy.updateConfirmsStateTrue(userIndex);

    const isConfirmsCompleted = await crazyNoisy.isConfirmsCompleted();
    if (isConfirmsCompleted) {
        const replyMessage = require("../template/messages/crazy_noisy/replyConfirmsCompleted");

        await crazyNoisy.updateDay();
        await crazyNoisy.updateDiscussStatusTrue();
        await crazyNoisy.updateTimeSetting(); // 話し合い時間に関する設定を挿入
        const timer = await crazyNoisy.getTimer(); // タイマー設定を取得
        return client.replyMessage(replyToken, await replyMessage.main(timer));
    }
}

/**
 * 話し合いの残り時間を通知する
 *
 * @param {*} plId
 * @param {*} replyToken
 * @returns
 */
const replyRemainingTime = async (plId, replyToken) => {
    const replyMessage = require("../template/messages/crazy_noisy/replyRemainingTime");
    const crazyNoisy = new CrazyNoisy(plId);

    const remainingTime = await crazyNoisy.getRemainingTime();

    return client.replyMessage(replyToken, await replyMessage.main(remainingTime));
}

/**
 * 話し合いが1分を切っていた場合の処理
 *
 * @param {*} plId
 * @param {*} replyToken
 * @returns
 */
const replyNotify = async (plId, replyToken) => {
    const replyMessage = require("../template/messages/crazy_noisy/replyNotify");
    const crazyNoisy = new CrazyNoisy(plId);

    await crazyNoisy.updateNotifyStatusTrue();
    return client.replyMessage(replyToken, await replyMessage.main());
}

const replyNotifyAndRemainingTime = async (plId, replyToken) => {
    const replyMessage = require("../template/messages/crazy_noisy/replyNotifyAndRemainingTime");
    const crazyNoisy = new CrazyNoisy(plId);

    const remainingTime = await crazyNoisy.getRemainingTime();
    await crazyNoisy.updateNotifyStatusTrue();

    return client.replyMessage(replyToken, await replyMessage.main(remainingTime));

}

/**
 * 話し合いが終了されたときのリプライ
 * 
 * DB変更操作は以下の通り
 * １．投票データを作成
 * ２．議論ステータスをfalseに更新
 *
 * @param {*} plId
 * @param {*} replyToken
 * @returns
 */
const replyDiscussFinish = async (plId, replyToken) => {
    const crazyNoisy = new CrazyNoisy(plId);

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
    const replyMessage = require("../template/messages/crazy_noisy/replyDiscussFinish");

    return client.replyMessage(replyToken, await replyMessage.main(displayNames, userIds));
}


/**
 * Postbackで適切な投票が行われたときのリプライ
 * 
 * DB変更操作は以下の通り
 * １．投票ユーザーの投票状況をtrueにする
 * ２．得票ユーザーの得票数を+1する
 * ３．この投票により全員の投票が確認され最多得票者が1人の場合、勝者を表示する
 * ３’．この投票により全員の投票が確認され最多得票者が2人以上の場合、再投票データを作成する
 * ４’．投票データを初期化する
 *
 * @param {*} plId
 * @param {*} postbackData : 得票者のuserId
 * @param {*} replyToken
 * @param {*} userIndex : 投票者のインデックス
 * @returns
 */
const replyVoteSuccess = async (plId, postbackData, replyToken, userIndex) => {

    const crazyNoisy = new CrazyNoisy(plId);
    const voterDisplayName = await crazyNoisy.getDisplayName(userIndex);

    // DB変更操作１，２
    // 投票ユーザーの投票状況をtrueにできたら得票ユーザーの得票数を+1する同期処理
    const votedUserIndex = await crazyNoisy.getUserIndexFromUserId(postbackData);
    await crazyNoisy.updateUserVoteStatus(userIndex).then(crazyNoisy.updateVoteNumber(votedUserIndex));

    const replyVoteSuccess = require("../template/messages/crazy_noisy/replyVoteSuccess");
    const replyVoteSuccessMessage = await replyVoteSuccess.main(voterDisplayName);

    const isVoteCompleted = await crazyNoisy.isVoteCompleted();
    if (isVoteCompleted) {

        const displayNames = await crazyNoisy.getDisplayNames();
        const userIds = await crazyNoisy.getUserIds();
        const day = await crazyNoisy.getDay();

        const multipleMostVotedUserExists = await crazyNoisy.multipleMostVotedUserExists();
        if (!multipleMostVotedUserExists) { // 最多得票者が一人だった場合

            const mostVotedUserIndex = await crazyNoisy.getMostVotedUserIndex(); // 最多得票者
            const executorDisplayName = await crazyNoisy.getDisplayName(mostVotedUserIndex);
            await crazyNoisy.updateVoteStatusFalse(); // 投票ステータスfalseに
            await crazyNoisy.updateRevoteStatusFalse(); // 再投票ステータスfalseに

            const replyExecutor = require("../template/messages/crazy_noisy/replyExecutor");
            const replyExecutorMessage = await replyExecutor.main(executorDisplayName);

            const isGuru = await crazyNoisy.isGuru(mostVotedUserIndex); // 最多得票者が教祖かどうか

            if (!isGuru) { // 最多得票者が教祖じゃなかった場合

                await crazyNoisy.updateBrainwashState(mostVotedUserIndex); // 最多投票者洗脳
                await crazyNoisy.addCrazinessId(mostVotedUserIndex); // 最多投票者狂気追加

                const isBrainwashCompleted = await crazyNoisy.isBrainwashCompleted();
                if (!isBrainwashCompleted) {

                    await crazyNoisy.updateActionStatusTrue(); // ステータスをアクション中に

                    const replyVoteFinish = require("../template/messages/crazy_noisy/replyVoteFinish");
                    const replyVoteFinishMessage = await replyVoteFinish.main(executorDisplayName, day);
                    const replyMessage = await replyVoteSuccessMessage.concat(replyExecutorMessage, replyVoteFinishMessage);

                    await client.replyMessage(replyToken, replyMessage);

                    const positions = await crazyNoisy.getPositions();
                    for (let i = 0; i < userIds.length; i++) {
                        const pushUserAction = require("../template/messages/crazy_noisy/pushUserAction");

                        const targetDisplayNames = await crazyNoisy.getActionTargetsDisplayNames(i);
                        const targetUserIds = await crazyNoisy.getActionTargetsUserIds(i);
                        await crazyNoisy.initializeActionsStatus();
                        const isBrainwash = await crazyNoisy.isBrainwash(i);
                        console.log(displayNames[i]+isBrainwash);
                        if (positions[i] == crazyNoisy.detective && isBrainwash) {
                            await crazyNoisy.updateActionsStateTrue(i);
                        }
                        // await sleep(4000);

                        await client.pushMessage(userIds[i], await pushUserAction.main(displayNames[i], positions[i], isBrainwash, targetDisplayNames, targetUserIds));
                    }
                } else { // 洗脳が完了したら
                    await crazyNoisy.updateWinnerStatusTrue();
                    const isWinnerGuru = true;
                    const winnerIndexes = await crazyNoisy.getWinnerIndexes(isWinnerGuru);

                    const replyWinner = require("../template/messages/crazy_noisy/replyWinner");
                    const replyWinnerMessage = await replyWinner.main(displayNames, isWinnerGuru, winnerIndexes);
                    const replyMessage = await replyVoteSuccessMessage.concat(replyExecutorMessage, replyWinnerMessage);

                    return client.replyMessage(replyToken, replyMessage);
                }
            } else { // 最多得票者が教祖だった場合

                await crazyNoisy.updateWinnerStatusTrue();
                const isWinnerGuru = false;
                const winnerIndexes = await crazyNoisy.getWinnerIndexes(isWinnerGuru);

                const replyWinner = require("../template/messages/crazy_noisy/replyWinner");
                const replyWinnerMessage = await replyWinner.main(displayNames, isWinnerGuru, winnerIndexes);
                const replyMessage = await replyVoteSuccessMessage.concat(replyExecutorMessage, replyWinnerMessage);

                return client.replyMessage(replyToken, replyMessage);
            }

        } else { // 最多得票者が複数いた場合
            const mostVotedUserIndexes = await crazyNoisy.getMostVotedUserIndexes(); // 最多得票者の配列
            const revoteStatus = await crazyNoisy.getRevoteStatus();
            if (!revoteStatus) { // 一回目の投票の場合

                const replyRevote = require("../template/messages/crazy_noisy/replyRevote");
                const replyRevoteMessage = await replyRevote.main(displayNames, userIds, mostVotedUserIndexes);

                // DB変更操作３’，４’
                // 再投票データを作成したら、投票データを初期化する同期処理
                const hasRevote = await crazyNoisy.hasRevote();
                if (!hasRevote) { // 再投票データ持ってなかったら
                    await crazyNoisy.createRevote(mostVotedUserIndexes);

                } else { // 既に持ってたら
                    await crazyNoisy.initializeRevote(mostVotedUserIndexes);
                }

                await crazyNoisy.initializeVote();
                await crazyNoisy.updateRevoteStatusTrue();

                const replyMessage = await replyVoteSuccessMessage.concat(replyRevoteMessage);

                return client.replyMessage(replyToken, replyMessage);
            } else { // 再投票中だった場合

                await crazyNoisy.updateVoteStatusFalse();
                await crazyNoisy.updateRevoteStatusFalse();

                const executorIndex = await crazyNoisy.chooseExecutorIndex(mostVotedUserIndexes); // 処刑者をランダムで決定
                const executorDisplayName = await crazyNoisy.getDisplayName(executorIndex);

                const replyExecutorInRevote = require("../template/messages/crazy_noisy/replyExecutorInRevote");
                const replyExecutorInRevoteMessage = await replyExecutorInRevote.main(executorDisplayName);

                const isGuru = await crazyNoisy.isGuru(executorIndex); // 最多得票者が教祖かどうか
                if (!isGuru) { // 処刑者が教祖じゃなかったら

                    await crazyNoisy.updateBrainwashState(executorIndex); // 最多投票者洗脳
                    await crazyNoisy.addCrazinessId(executorIndex); // 最多投票者狂気追加

                    const isBrainwashCompleted = await crazyNoisy.isBrainwashCompleted();
                    if (!isBrainwashCompleted) {

                        await crazyNoisy.updateActionStatusTrue();

                        const replyVoteFinish = require("../template/messages/crazy_noisy/replyVoteFinish");
                        const replyVoteFinishMessage = await replyVoteFinish.main(executorDisplayName, day);

                        const replyMessage = await replyVoteSuccessMessage.concat(replyExecutorInRevoteMessage, replyVoteFinishMessage);

                        await client.replyMessage(replyToken, replyMessage);

                        const positions = await crazyNoisy.getPositions();
                        for (let i = 0; i < userIds.length; i++) {
                            const pushUserAction = require("../template/messages/crazy_noisy/pushUserAction");

                            const targetDisplayNames = await crazyNoisy.getActionTargetsDisplayNames(i);
                            const targetUserIds = await crazyNoisy.getActionTargetsUserIds(i);
                            await crazyNoisy.initializeActionsStatus();
                            const isBrainwash = await crazyNoisy.isBrainwash(i);
                            if (positions[i] == crazyNoisy.detective && isBrainwash) {
                                await crazyNoisy.updateActionsStateTrue(i);
                            }
                            // await sleep(4000);

                            await client.pushMessage(userIds[i], await pushUserAction.main(displayNames[i], positions[i],isBrainwash, targetDisplayNames, targetUserIds));
                        }
                    } else { // 洗脳が完了したら
                        await crazyNoisy.updateWinnerStatusTrue();
                        const isWinnerGuru = true;
                        const winnerIndexes = await crazyNoisy.getWinnerIndexes(isWinnerGuru);

                        const replyWinner = require("../template/messages/crazy_noisy/replyWinner");
                        const replyWinnerMessage = await replyWinner.main(displayNames, isWinnerGuru, winnerIndexes);
                        const replyMessage = await replyVoteSuccessMessage.concat(replyExecutorInRevoteMessage, replyWinnerMessage);

                        return client.replyMessage(replyToken, replyMessage);
                    }
                } else {
                    await crazyNoisy.updateWinnerStatusTrue(); // 勝者発表状況をtrueにする
                    const isWinnerGuru = false;
                    const winnerIndexes = await crazyNoisy.getWinnerIndexes(isWinnerGuru);

                    const replyWinner = require("../template/messages/crazy_noisy/replyWinner");
                    const replyWinnerMessage = await replyWinner.main(displayNames, isWinnerGuru, winnerIndexes);
                    const replyMessage = await replyVoteSuccessMessage.concat(replyExecutorInRevoteMessage, replyWinnerMessage);

                    return client.replyMessage(replyToken, replyMessage);
                }
            }

        }


    } else { // まだ全員の投票が済んでなかったら
        const replyMessage = replyVoteSuccessMessage;
        return client.replyMessage(replyToken, replyMessage);
    }
}

const replySelfVote = async (plId, replyToken, userIndex) => {
    const replyMessage = require("../template/messages/crazy_noisy/replySelfVote");
    const crazyNoisy = new CrazyNoisy(plId);
    const displayNames = await crazyNoisy.getDisplayNames();
    const displayName = displayNames[userIndex];
    return client.replyMessage(replyToken, await replyMessage.main(displayName));
}

const replyDuplicateVote = async (plId, replyToken, userIndex) => {
    const replyMessage = require("../template/messages/crazy_noisy/replyDuplicateVote");
    const crazyNoisy = new CrazyNoisy(plId);
    const displayNames = await crazyNoisy.getDisplayNames();
    const displayName = displayNames[userIndex];
    return client.replyMessage(replyToken, await replyMessage.main(displayName));
}

/**
 * 教祖のアクションに対するリプライ
 *
 * @param {*} plId
 * @param {*} userIndex
 * @param {*} targetUserIndex
 * @param {*} replyToken
 * @returns
 */
const replyGuruAction = async (plId, userIndex, targetUserIndex, replyToken) => {
    const replyMessage = require("../template/messages/crazy_noisy/replyGuruAction");
    const crazyNoisy = new CrazyNoisy(plId);
    await crazyNoisy.updateBrainwashState(targetUserIndex);
    await crazyNoisy.addCrazinessId(targetUserIndex);
    await crazyNoisy.updateActionsStateTrue(userIndex);
    const displayName = await crazyNoisy.getDisplayName(targetUserIndex);

    await client.replyMessage(replyToken, await replyMessage.main(displayName));

    const isActionsCompleted = await crazyNoisy.isActionsCompleted();
    if (isActionsCompleted) {
        const pushCraziness = require("../template/messages/crazy_noisy/pushUserCraziness");
        const userNumber = await crazyNoisy.getUserNumber();
        const crazinessIds = await crazyNoisy.getCrazinessIds();
        const userIds = await crazyNoisy.getUserIds();

        for (let i = 0; i < userNumber; i++) {
            if (crazinessIds[i][0] != null) {
                let contents = [];
                let remarks = [];
                for (let crazinessId of crazinessIds[i]) {
                    if (crazinessId != null) {
                        const content = await crazyNoisy.getCrazinessContent(crazinessId);
                        const remark = await crazyNoisy.getCrazinessRemark(crazinessId);
                        contents.push(content);
                        remarks.push(remark);
                    } else {
                        break; // 詰めて入ってるので抜ける
                    }
                }
                console.log(contents);
                await client.pushMessage(userIds[i], await pushCraziness.main(contents, remarks));
            }
        }
        // await sleep(1000); // 5秒待つ

        await crazyNoisy.updateDay(); // 日付更新
        const day = await crazyNoisy.getDay();
        const pushDay = require("../template/messages/crazy_noisy/pushDay");
        const pushDayMessage = await pushDay.main(day);
        const groupId = await crazyNoisy.getGroupId(plId);

        const isBrainwashCompleted = await crazyNoisy.isBrainwashCompleted();
        if (!isBrainwashCompleted) {
            await crazyNoisy.updateTimeSetting();
            const timer = await crazyNoisy.getTimer(); // タイマー設定を取得

            const pushFinishActions = require("../template/messages/crazy_noisy/pushFinishActions");
            const pushFinishActionsMessage = await pushFinishActions.main(day, timer);

            await crazyNoisy.updateActionStatusFalse();
            await crazyNoisy.updateDiscussStatusTrue();

            const pushMessage = await pushDayMessage.concat(pushFinishActionsMessage);

            return client.pushMessage(groupId, pushMessage);

        } else { // 洗脳が完了したら
            await crazyNoisy.updateWinnerStatusTrue(); // 勝者発表状況をtrueにする
            const isWinnerGuru = true;
            const winnerIndexes = await crazyNoisy.getWinnerIndexes(isWinnerGuru);

            const replyWinner = require("../template/messages/crazy_noisy/replyWinner");
            const displayNames = await crazyNoisy.getDisplayNames();
            const pushWinnerMessage = await replyWinner.main(displayNames, isWinnerGuru, winnerIndexes);

            const pushMessage = await pushDayMessage.concat(pushWinnerMessage);
            return client.pushMessage(groupId, pushMessage);
        }

    }
}

/**
 * 探偵のアクションに対するリプライ
 *
 * @param {*} plId
 * @param {*} userIndex
 * @param {*} targetUserIndex
 * @param {*} replyToken
 */
const replyDetectiveAction = async (plId, userIndex, targetUserIndex, replyToken) => {
    const replyMessage = require("../template/messages/crazy_noisy/replyDetectiveAction");
    const crazyNoisy = new CrazyNoisy(plId);
    await crazyNoisy.updateActionsStateTrue(userIndex);
    const isGuru = await crazyNoisy.isGuru(targetUserIndex);
    const displayName = await crazyNoisy.getDisplayName(targetUserIndex);

    await client.replyMessage(replyToken, await replyMessage.main(displayName, isGuru));

    const isActionsCompleted = await crazyNoisy.isActionsCompleted();
    if (isActionsCompleted) {
        const pushCraziness = require("../template/messages/crazy_noisy/pushUserCraziness");
        const userNumber = await crazyNoisy.getUserNumber();
        const crazinessIds = await crazyNoisy.getCrazinessIds();
        const userIds = await crazyNoisy.getUserIds();

        for (let i = 0; i < userNumber; i++) {
            if (crazinessIds[i][0] != null) {
                let contents = [];
                let remarks = [];
                for (let crazinessId of crazinessIds[i]) {
                    if (crazinessId != null) {
                        const content = await crazyNoisy.getCrazinessContent(crazinessId);
                        const remark = await crazyNoisy.getCrazinessRemark(crazinessId);
                        contents.push(content);
                        remarks.push(remark);
                    } else {
                        break; // 詰めて入ってるので抜ける
                    }
                }
                console.log(contents);
                await client.pushMessage(userIds[i], await pushCraziness.main(contents, remarks));
            }
        }

        // await sleep(1000); // 5秒待つ

        await crazyNoisy.updateDay(); // 日付更新
        const day = await crazyNoisy.getDay();
        const pushDay = require("../template/messages/crazy_noisy/pushDay");
        const pushDayMessage = await pushDay.main(day);
        const groupId = await crazyNoisy.getGroupId(plId);

        const isBrainwashCompleted = await crazyNoisy.isBrainwashCompleted();
        if (!isBrainwashCompleted) {
            await crazyNoisy.updateTimeSetting();
            const timer = await crazyNoisy.getTimer(); // タイマー設定を取得

            const pushFinishActions = require("../template/messages/crazy_noisy/pushFinishActions");
            const pushFinishActionsMessage = await pushFinishActions.main(day, timer);

            await crazyNoisy.updateActionStatusFalse();
            await crazyNoisy.updateDiscussStatusTrue();

            const pushMessage = await pushDayMessage.concat(pushFinishActionsMessage);

            return client.pushMessage(groupId, pushMessage);

        } else { // 洗脳が完了したら
            await crazyNoisy.updateWinnerStatusTrue(); // 勝者発表状況をtrueにする
            const isWinnerGuru = true;
            const winnerIndexes = await crazyNoisy.getWinnerIndexes(isWinnerGuru);

            const replyWinner = require("../template/messages/crazy_noisy/replyWinner");
            const displayNames = await crazyNoisy.getDisplayNames();
            const pushWinnerMessage = await replyWinner.main(displayNames, isWinnerGuru, winnerIndexes);

            const pushMessage = await pushDayMessage.concat(pushWinnerMessage);
            return client.pushMessage(groupId, pushMessage);
        }

    }
}

const replyResult = async (plId, replyToken) => {
    const crazyNoisy = new CrazyNoisy(plId);
    const pl = new ParticipantList();

    await crazyNoisy.updateResultStatusTrue();
    await pl.finishParticipantList(plId);

    const userNumber = await crazyNoisy.getUserNumber();
    const displayNames = await crazyNoisy.getDisplayNames();
    const positions = await crazyNoisy.getPositions();
    const crazinessIds = await crazyNoisy.getCrazinessIds();

    let contentsList = []
    for (let i = 0; i < userNumber; i++) {
        let contents = [];
        if (crazinessIds[i][0] != null) {
            for (let crazinessId of crazinessIds[i]) {
                if (crazinessId != null) {
                    const content = await crazyNoisy.getCrazinessContent(crazinessId);
                    contents.push(content);
                } else {
                    break; // 詰めて入ってるので抜ける
                }
            }
        }
        contentsList.push(contents);
    }

    const replyMessage = require("../template/messages/crazy_noisy/replyResult");
    await client.replyMessage(replyToken, await replyMessage.main(displayNames, positions, contentsList));
}

const sleep = (waitSec) => {
    return new Promise(function (resolve) {
        setTimeout(function () { resolve() }, waitSec);
    });
} 