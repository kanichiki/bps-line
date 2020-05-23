const line = require("@line/bot-sdk");
const config = {
    channelAccessToken: process.env.channelAccessToken,
    channelSecret: process.env.channelSecret
};

const client = new line.Client(config);
const WordWolf = require("../classes/WordWolf");
const PlayingGame = require("../classes/PlayingGame");
const ParticipantList = require("../classes/ParticipantList")

const commonFunction = require("../template/functions/commonFunction");

/**
 * ワードウルフの参加者が募集中の場合に点呼終了コールされたときの分岐
 *
 * @param {*} plId
 * @param {*} replyToken
 * @param {*} promises
 */
exports.rollCallBranch = async (plId, replyToken, promises) => {
    const pl = new ParticipantList();
    const userNumber = await pl.getUserNumber(plId); // 
    if (userNumber < 3) { // 参加者数が2人以下の場合
        await promises.push(replyTooFewParticipant(plId, replyToken));
    } else {
        // 参加受付終了の意思表明に対するリプライ
        // 参加受付を終了した旨（TODO 参加者を変更したい場合はもう一度「参加者が」ゲーム名を発言するように言う）、参加者のリスト、該当ゲームの最初の設定のメッセージを送る
        await promises.push(replyRollCallEnd(plId, replyToken));
    }
}

/**
 * eventがメッセージかつワードウルフがプレイ中で参加者の発言だった場合の分岐
 *
 * @param {*} plId
 * @param {*} text
 * @param {*} replyToken
 * @param {*} promises
 */
exports.playingMessageBranch = async (plId, text, replyToken, promises) => {
    const wordWolf = new WordWolf(plId);
    const genreStatus = await wordWolf.getGenreStatus();
    if (!genreStatus) { // ジャンルがまだ指定されてない場合

        /* ジャンル
        const genreNameExists = await wordWolf.genreNameExists(text); // 存在するジャンルの名前が発言されたかどうか
        if (genreNameExists) { // ジャンルの名前が発言された場合
            const genreId = await wordWolf.getGenreIdFromName(text); // 名前からジャンルのidをとってくる
            console.log("genreId:" + genreId);
            // ジャンル選択後のリプライ
            await promises.push(replyGenreChosen(plId, genreId, replyToken));
        }
        */

        // depth
        if (((text == 1 || text == 2) || (text == 3 || text == 4)) || text == 5) {
            await promises.push(replyDepthChosen(plId, text, replyToken));
        }
    } else { // ジャンルが選択済みの場合

        const wolfNumberStatus = await wordWolf.getWolfNumberStatus();
        if (!wolfNumberStatus) { // ウルフの人数がまだ指定されてない場合

            const wolfNumberExists = await wordWolf.wolfNumberExists(text); // ウルフの人数（"2人"など)が発言されたかどうか
            if (wolfNumberExists) {

                const wolfNumber = await wordWolf.getWolfNumberFromText(text); // textからウルフの人数(2など)を取得
                console.log("wolfNumber:" + wolfNumber);
                await promises.push(replyWolfNumberChosen(plId, wolfNumber, replyToken));
            }
        } else { // ウルフの数が指定済みの場合

            const lunaticStatus = await wordWolf.getLunaticStatus();
            if (!lunaticStatus) { // 狂人の設定がまだの場合

                const lunaticNumberExists = await wordWolf.lunaticNumberExists(text);
                if (lunaticNumberExists) { // 狂人の人数が発言された場合

                    const lunaticNumber = await wordWolf.getLunaticNumberFromText(text);
                    await promises.push(replyLunaticNumberChosen(plId, lunaticNumber, replyToken));
                }
            } else {

                const settingConfirmStatus = await wordWolf.getSettingConfirmStatus();
                if (!settingConfirmStatus) {
                    if (text == "はい") {
                        await promises.push(replyConfirmYes(plId, replyToken));
                    } else if (text == "いいえ") {
                        await promises.push(replyConfirmNo(plId, replyToken));
                    }
                } else {
                    const finishedStatus = await wordWolf.getFinishedStatus();
                    if (!finishedStatus) { // 話し合い中だった場合

                        if (text == "終了") {
                            await promises.push(replyFinish(plId, replyToken));
                        } else { // 発言が終了以外の場合
                            const isOverTime = await wordWolf.isOverTime();
                            if (isOverTime) { // 話し合い時間が終了していた場合
                                await promises.push(replyFinish(plId, replyToken));

                            } else {
                                if (text == "残り時間") {
                                    const isRemainingTimeLessThan1minute = await wordWolf.isRemainingTimeLessThan1minute();
                                    if (isRemainingTimeLessThan1minute) { // 話し合い時間が1分を切っていた場合

                                        const notifyStatus = await wordWolf.getNotifyStatus();
                                        if (!notifyStatus) { // 残り1分をまだ通知していなかった場合
                                            await promises.push(replyNotifyAndRemainingTime(plId, replyToken));
                                        } else {
                                            await promises.push(replyRemainingTime(plId, replyToken));
                                        }
                                    } else { // 残り1分切ってなかったら

                                        await promises.push(replyRemainingTime(plId, replyToken));
                                    }
                                }

                                const isRemainingTimeLessThan1minute = await wordWolf.isRemainingTimeLessThan1minute();
                                if (isRemainingTimeLessThan1minute) { // 話し合い時間が1分を切っていた場合

                                    const notifyStatus = await wordWolf.getNotifyStatus();
                                    if (!notifyStatus) { // 残り1分をまだ通知していなかった場合
                                        await promises.push(replyNotify(plId, replyToken));
                                    }
                                }

                            }
                        }


                    } else { // 話し合いが終了していた場合

                        const resultStatus = await wordWolf.getResultStatus();
                        if (!resultStatus) { // すべての結果発表がまだなら
                            if (text == "ワードを見る") {
                                await promises.push(replyAnnounceResult(plId, replyToken));
                            }
                        }

                    }
                }
            }
        }
    }
}

/**
 * eventがpostbackかつワードウルフがプレイ中で参加者のポストバックイベントだった場合の分岐
 *
 * @param {*} plId
 * @param {*} userId
 * @param {*} postbackData
 * @param {*} replyToken
 * @param {*} promises
 */
exports.postbackPlayingBranch = async (plId, userId, postbackData, replyToken, promises) => {
    const pl = new ParticipantList();
    const wordWolf = new WordWolf(plId);

    const finishedStatus = await wordWolf.getFinishedStatus();
    if (finishedStatus) {

        const winnerStatus = await wordWolf.getWinnerStatus();
        if (!winnerStatus) { // 勝者の発表がまだの場合

            const userIndex = await pl.getUserIndexFromUserId(plId, userId);
            const voteState = await wordWolf.getVoteState(userIndex);
            if (!voteState) { // postbackした参加者の投票がまだの場合

                const isRevoting = await wordWolf.isRevoting();
                if (!isRevoting) { // １回目の投票中だった場合

                    // const isUserIndex = await wordWolf.isUser(postbackData); 投票をユーザーインデックスからユーザーidに変更したので使わない
                    const isPostbackParticipant = await pl.isUserParticipant(plId, postbackData);
                    if (isPostbackParticipant) { // postbackのデータが参加者のインデックスだった場合

                        // この中は下の※と同じになるように
                        if (userId != postbackData) { // 自分以外に投票していた場合
                            await promises.push(replyVoteSuccess(plId, postbackData, replyToken, userIndex));

                        } else { // 自分に投票していた場合
                            await promises.push(replySelfVote(plId, replyToken, userIndex));
                        }
                    }

                } else { // 再投票中だった場合 
                    const votedUserIndex = await pl.getUserIndexFromUserId(plId, postbackData);
                    const isRevoteCandidateIndex = await wordWolf.isRevoteCandidateIndex(votedUserIndex);
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
    } else { // 話し合い中だった場合
        const isOverTime = await wordWolf.isOverTime();
        if (isOverTime) { // 話し合い時間が終了していた場合
            await promises.push(replyFinish(plId, replyToken));

        } else {
            if (postbackData == "残り時間") {
                const isRemainingTimeLessThan1minute = await wordWolf.isRemainingTimeLessThan1minute();
                if (isRemainingTimeLessThan1minute) { // 話し合い時間が1分を切っていた場合

                    const notifyStatus = await wordWolf.getNotifyStatus();
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
    const replyMessage = require("../template/messages/word_wolf/replyRollCallEnd");
    const pl = new ParticipantList();

    const displayNames = await pl.getDisplayNames(plId); // 参加者の表示名リスト

    // DB変更操作１
    await pl.updateIsPlayingTrue(plId).then(await pl.updateIsRecruitingFalse(plId)); // 参加者リストをプレイ中にして、募集中を解除する

    // DB変更操作２
    const wordWolf = new WordWolf(plId);
    const hasWordWolfStatus = await wordWolf.hasWordWolfStatus(); // ステータスデータがあるかどうか

    if (!hasWordWolfStatus) {
        await wordWolf.createWordWolfStatus(); // ワードウルフのゲーム進行状況データを作成
    }

    /* ジャンル
    const genres = await wordWolf.getAllGenreIdAndName(); // すべてのジャンルのid:nameのオブジェクト
 
    return client.replyMessage(replyToken, await replyMessage.main(displayNames, genres));
    */

    // 深さ

    return client.replyMessage(replyToken, await replyMessage.main(displayNames));
}


/**
 * ワードウルフにおいて、人数が3人未満の状態で参加受付終了がコールされたときリプライする
 *
 * @param {*} plId
 * @param {*} replyToken
 * @returns
 */
const replyTooFewParticipant = async (plId, replyToken) => {
    const replyMessage = require("../template/messages/word_wolf/replyTooFewParticipant.js");
    const pl = new ParticipantList();

    const displayNames = await pl.getDisplayNames(plId); // 参加者の表示名リスト
    const userNumber = await pl.getUserNumber(plId); // 参加者数

    const recruitingGame = new PlayingGame(plId);
    const recruitingGameName = await recruitingGame.getGameName();

    return client.replyMessage(replyToken, await replyMessage.main(displayNames, userNumber, recruitingGameName));
}

/**
 * ジャンルが選ばれたときのリプライ
 * 
 * DB変更操作は以下の通り
 * １．ワードウルフ設定テーブルを作成（なかった場合。確認でNoで帰ってくるパターンあり）
 * ２．ワードウルフ設定テーブルにワードセットIDを挿入
 * ３．ワードウルフ設定ステータステーブルのジャンルステータスをtrueに更新
 *
 * @param {*} plId
 * @param {*} genreId
 * @param {*} replyToken
 * @returns
 */
const replyGenreChosen = async (plId, genreId, replyToken) => {
    const replyMessage = require("../template/messages/word_wolf/replyGenreChosen");

    const wordWolf = new WordWolf(plId);
    const genreName = await wordWolf.getGenreName(genreId);

    // DB変更操作１、２
    // ワードセットはランダムで選んでる
    const hasWordWolfSetting = await wordWolf.hasWordWolfSetting(); // 設定テーブルを持っているかどうか
    if (!hasWordWolfSetting) {
        await wordWolf.createWordWolfSetting(); // 設定テーブル作成
    }
    await wordWolf.updateWordSetIdMatchGenreId(genreId).then(wordWolf.updateGenreStatusTrue());

    const wolfNumberOptions = await wordWolf.getWolfNumberOptions()

    return client.replyMessage(replyToken, await replyMessage.main(genreName, wolfNumberOptions));
}

// depth
const replyDepthChosen = async (plId, text, replyToken) => {
    const replyMessage = require("../template/messages/word_wolf/replyGenreChosen");

    const wordWolf = new WordWolf(plId);

    // DB変更操作１、２
    // ワードセットはランダムで選んでる
    const hasWordWolfSetting = await wordWolf.hasWordWolfSetting(); // 設定テーブルを持っているかどうか
    if (!hasWordWolfSetting) {
        await wordWolf.createWordWolfSetting(); // 設定テーブル作成
    }
    await wordWolf.updateWordSetIdMatchDepth(text).then(wordWolf.updateGenreStatusTrue());

    const wolfNumberOptions = await wordWolf.getWolfNumberOptions();

    return client.replyMessage(replyToken, await replyMessage.main(text, wolfNumberOptions));
}


/**
 * ウルフの人数が選ばれたときのリプライ
 * 
 * DB変更操作は以下の通り
 * １．ワードウルフ設定テーブルのウルフナンバーを更新
 * ２．ワードウルフ設定ステータステーブルのウルフナンバーステータスをtrueに更新
 *
 * @param {*} plId
 * @param {*} wolfNumber
 * @param {*} replyToken
 * @returns
 */
const replyWolfNumberChosen = async (plId, wolfNumber, replyToken) => {
    const replyMessage = require("../template/messages/word_wolf/replyWolfNumberChosen");

    const wordWolf = new WordWolf(plId);

    //ウルフ番号データを挿入できたらステータスをtrueにする
    await wordWolf.updateWolfIndexes(wolfNumber).then(wordWolf.updateWolfNumberStatusTrue());

    const lunaticNumberOptions = await wordWolf.getLunaticNumberOptions();

    return client.replyMessage(replyToken, await replyMessage.main(wolfNumber, lunaticNumberOptions));
}

/**
 * 狂人の人数が選ばれたときのリプライ
 *
 * @param {*} plId
 * @param {*} lunaticNumber
 * @param {*} replyToken
 * @returns
 */
const replyLunaticNumberChosen = async (plId, lunaticNumber, replyToken) => {
    const replyMessage = require("../template/messages/word_wolf/replyLunaticNumberChosen");

    const wordWolf = new WordWolf(plId);

    //狂人番号データを挿入できたらステータスをtrueにする
    await wordWolf.updateLunaticIndexes(lunaticNumber).then(wordWolf.updateLunaticStatusTrue());

    /* ジャンル
    const genreId = await wordWolf.getGenreId();
    const genreName = await wordWolf.getGenreName(genreId);
 
    return client.replyMessage(replyToken, await replyMessage.main(wolfNumber, genreName));
    */

    // depth
    const depth = await wordWolf.getDepth();

    const wolfNumber = await wordWolf.getWolfNumber();
    return client.replyMessage(replyToken, await replyMessage.main(depth, wolfNumber, lunaticNumber));
}

/**
 * 設定確認に対してYesだった場合のリプライ
 *
 * @param {*} plId
 * @param {*} replyToken
 * @returns
 */
const replyConfirmYes = async (plId, replyToken) => {
    const replyMessage = require("../template/messages/word_wolf/replyConfirmYes");
    const pushMessage = require("../template/messages/word_wolf/pushUserWord");

    const wordWolf = new WordWolf(plId);
    await wordWolf.updateConfirmStatusTrue();
    await wordWolf.updateTimeSetting(); // 話し合い時間に関する設定を挿入

    // const profiles = await wordWolf.getDisplayNames();
    const wolfIndexes = await wordWolf.getWolfIndexes();
    const lunaticIndexes = await wordWolf.getLunaticIndexes();
    const citizenWord = await wordWolf.getCitizenWord();
    const wolfWord = await wordWolf.getWolfWord();
    const userNumber = await wordWolf.getUserNumber();

    let userIds = [];
    let profiles = [];
    let userWords = [];
    let isLunatic = [];
    for (let i = 0; i < userNumber; i++) {
        userIds[i] = await wordWolf.getUserId(i);
        const profile = await client.getProfile(userIds[i]);
        profiles[i] = profile.displayName;
        if (wolfIndexes.indexOf(i) == -1) {
            userWords[i] = citizenWord;
        } else {
            userWords[i] = wolfWord;
        }

        if (lunaticIndexes.indexOf(i) == -1) {
            isLunatic[i] = false;
        } else {
            isLunatic[i] = true;
        }
    }

    console.log(profiles);

    for (let i = 0; i < userNumber; i++) {
        // プッシュメッセージ数節約のため開発時は一時的に無効化
        client.pushMessage(userIds[i], await pushMessage.main(profiles[i], userWords[i], isLunatic[i]))
    }

    const timer = await wordWolf.getTimer(); // タイマー設定を取得

    return client.replyMessage(replyToken, await replyMessage.main(timer));
}

/**
 * 設定確認に対してNoだった場合のリプライ
 * 
 * DB変更操作は以下の通り
 * １．ワードウルフ設定ステータステーブルのジャンルステータスをfalseに変更
 * ２．ワードウルフ設定ステータステーブルのウルフナンバーステータスをfalseに変更
 *
 * @param {*} plId
 * @param {*} replyToken
 */
const replyConfirmNo = async (plId, replyToken) => {
    const replyMessage = require("../template/messages/word_wolf/replyConfirmNo");

    const wordWolf = new WordWolf(plId);

    /*
    // DB変更操作１
    await wordWolf.updateGenreStatusFalse();
    // DB変更操作２
    await wordWolf.updateWolfNumberStatusFalse();
    */
    await wordWolf.resetSettingStatus();

    /* ジャンル
    const genres = await wordWolf.getAllGenreIdAndName(); // すべてのジャンルのid:nameのオブジェクト
 
    return client.replyMessage(replyToken, await replyMessage.main(genres));
    */

    const depths = ["1", "2", "3", "4"];
    return client.replyMessage(replyToken, await replyMessage.main(depths));
}

/**
 * 話し合いが終了されたときのリプライ
 * 
 * DB変更操作は以下の通り
 * １．投票データを作成
 * ２．話し合い終了ステータスをtrueに更新
 *
 * @param {*} plId
 * @param {*} usePostback →廃止
 * @param {*} replyToken
 * @returns
 */
const replyFinish = async (plId, replyToken) => {
    const wordWolf = new WordWolf(plId);

    // DB変更操作１，２
    // 投票データを挿入出来たら話し合い終了ステータスをtrueにする同期処理
    await wordWolf.createWordWolfVote().then(wordWolf.updateFinishedStatusTrue());
    await wordWolf.updateNotifyStatusTrue();

    const userNumber = await wordWolf.getUserNumber();
    const shuffleUserIndexes = await commonFunction.makeShuffuleNumberArray(userNumber);

    let userIds = [];
    let displayNames = [];

    // 公平にするため投票用の順番はランダムにする
    for (let i = 0; i < userNumber; i++) {
        userIds[i] = await wordWolf.getUserId(shuffleUserIndexes[i]);
        const profile = await client.getProfile(userIds[i]);
        displayNames[i] = profile.displayName;
    }


    //if (usePostback) { // postbackを使う設定の場合
    const replyMessage = require("../template/messages/word_wolf/replyFinish");

    return client.replyMessage(replyToken, await replyMessage.main(displayNames, userIds));

    /*} else { // postbackを使わない設定の場合
        const replyMessage = require("../template/messages/word_wolf/withoutPostback/replyFinishWithoutPostback");
        const pushMessage = require("../template/messages/word_wolf/withoutPostback/pushFinishWithoutPostback");

        const userIds = await wordWolf.getUserIds();

        await client.replyMessage(replyToken, await replyMessage.main()); // 話し合い終了のグループリプライ

        for (let userIndex = 0; userIndex < userIds.length; userIndex++) {
            // 個人チャットで投票を送る
            client.pushMessage(userIds[userIndex], await pushMessage.main(shuffleUserIndexes, displayNames, userIndex));
        }

    }*/
}

/**
 * 話し合いの残り時間を通知する
 *
 * @param {*} plId
 * @param {*} replyToken
 * @returns
 */
const replyRemainingTime = async (plId, replyToken) => {
    const replyMessage = require("../template/messages/word_wolf/replyRemainingTime");
    const wordWolf = new WordWolf(plId);

    const remainingTime = await wordWolf.getRemainingTime();

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
    const replyMessage = require("../template/messages/word_wolf/replyNotify");
    const wordWolf = new WordWolf(plId);

    await wordWolf.updateNotifyStatusTrue();
    return client.replyMessage(replyToken, await replyMessage.main());
}

const replyNotifyAndRemainingTime = async (plId, replyToken) => {
    const replyMessage = require("../template/messages/word_wolf/replyNotifyAndRemainingTime");
    const wordWolf = new WordWolf(plId);

    const remainingTime = await wordWolf.getRemainingTime();
    await wordWolf.updateNotifyStatusTrue();

    return client.replyMessage(replyToken, await replyMessage.main(remainingTime));

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

    const wordWolf = new WordWolf(plId);
    const pl = new ParticipantList();
    const voterDisplayName = await wordWolf.getDisplayName(userIndex);

    // DB変更操作１，２
    // 投票ユーザーの投票状況をtrueにできたら得票ユーザーの得票数を+1する同期処理
    const votedUserIndex = await pl.getUserIndexFromUserId(plId, postbackData);
    await wordWolf.updateVoteStatus(userIndex).then(wordWolf.updateVoteNumber(votedUserIndex));

    const isVoteCompleted = await wordWolf.isVoteCompleted();
    if (isVoteCompleted) {

        const multipleMostVotedUserExists = await wordWolf.multipleMostVotedUserExists();
        if (!multipleMostVotedUserExists) { // 最多得票者が一人だった場合

            const replyMessage = require("../template/messages/word_wolf/replyAnnounceWinner");
            const mostVotedUserIndex = await wordWolf.getMostVotedUserIndex(); // 最多得票者＝処刑者
            const executorDisplayName = await wordWolf.getDisplayName(mostVotedUserIndex);
            const isExecutorWolf = await wordWolf.isUserWolf(mostVotedUserIndex); // 処刑者がウルフかどうか

            await wordWolf.updateWinnerStatusTrue(); // 勝者発表状況をtrueにする
            const displayNames = await wordWolf.getDisplayNames();
            const isWinnerArray = await wordWolf.isWinnerArray(isExecutorWolf); 

            return client.replyMessage(replyToken, await replyMessage.main(voterDisplayName, executorDisplayName, isExecutorWolf,displayNames,isWinnerArray));

        } else { // 最多得票者が複数いた場合
            const mostVotedUserIndexes = await wordWolf.getMostVotedUserIndexes(); // 最多得票者の配列
            const isRevoting = await wordWolf.isRevoting();
            if (!isRevoting) { // 一回目の投票の場合

                const replyMessage = require("../template/messages/word_wolf/replyRevote");

                // DB変更操作３’，４’
                // 再投票データを作成したら、投票データを初期化する同期処理
                await wordWolf.createWordWolfRevote(mostVotedUserIndexes).then(await wordWolf.initializeWordWolfVote());

                const displayNames = await wordWolf.getDisplayNames();
                const userIds = await pl.getUserIds(plId);
                return client.replyMessage(replyToken, await replyMessage.main(voterDisplayName, displayNames, userIds, mostVotedUserIndexes));
            } else {
                const replyMessage = require("../template/messages/word_wolf/replyAnnounceWinnerInRevote");
                const executorIndex = await wordWolf.chooseExecutorIndex(mostVotedUserIndexes); // 処刑者をランダムで決定
                const executorDisplayName = await wordWolf.getDisplayName(executorIndex);
                const isExecutorWolf = await wordWolf.isUserWolf(executorIndex); // 処刑者がウルフかどうか

                await wordWolf.updateWinnerStatusTrue(); // 勝者発表状況をtrueにする
                const displayNames = await wordWolf.getDisplayNames();
                const isWinnerArray = await wordWolf.isWinnerArray(isExecutorWolf); 

                return client.replyMessage(replyToken, await replyMessage.main(voterDisplayName, executorDisplayName, isExecutorWolf,displayNames,isWinnerArray));
            }

        }


    } else {
        const replyMessage = require("../template/messages/word_wolf/replyVoteSuccess");
        return client.replyMessage(replyToken, await replyMessage.main(voterDisplayName));
    }
}

const replySelfVote = async (plId, replyToken, userIndex) => {
    const replyMessage = require("../template/messages/word_wolf/replySelfVote");
    const wordWolf = new WordWolf(plId);
    const displayNames = await wordWolf.getDisplayNames();
    const displayName = displayNames[userIndex];
    return client.replyMessage(replyToken, await replyMessage.main(displayName));
}

const replyDuplicateVote = async (plId, replyToken, userIndex) => {
    const replyMessage = require("../template/messages/word_wolf/replyDuplicateVote");
    const wordWolf = new WordWolf(plId);
    const displayNames = await wordWolf.getDisplayNames();
    const displayName = displayNames[userIndex];
    return client.replyMessage(replyToken, await replyMessage.main(displayName));
}

const replyAnnounceResult = async (plId, replyToken) => {
    const replyMessage = require("../template/messages/word_wolf/replyAnnounceResult");
    const wordWolf = new WordWolf(plId);
    const pl = new ParticipantList();

    const displayNames = await pl.getDisplayNames(plId);
    const wolfIndexes = await wordWolf.getWolfIndexes();
    const lunaticIndexes = await wordWolf.getLunaticIndexes();

    const citizenWord = await wordWolf.getCitizenWord();
    const wolfWord = await wordWolf.getWolfWord();

    await wordWolf.updateResultStatusTrue();
    await pl.finishParticipantList(plId);

    return client.replyMessage(replyToken, await replyMessage.main(displayNames, wolfIndexes, lunaticIndexes, citizenWord, wolfWord));
}

