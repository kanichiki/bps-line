const line = require("@line/bot-sdk");
const config = {
    channelAccessToken: process.env.channelAccessToken,
    channelSecret: process.env.channelSecret,
};

const client = new line.Client(config);
const WordWolf = require("../classes/WordWolf");
const PlayingGame = require("../classes/PlayingGame");
const ParticipantList = require("../classes/ParticipantList");

const commonFunction = require("../template/functions/commonFunction");

/**
 * ワードウルフの参加者が募集中の場合に点呼終了コールされたときの分岐
 *
 * @param {*} plId
 * @param {*} replyToken
 */
exports.rollCallBranch = async (plId, replyToken) => {
    const pl = new ParticipantList();
    const userNumber = await pl.getUserNumber(plId); //

    let minNumber = 3;
    if (process.env.SERVER_ENV == "dev") {
        minNumber = 2;
    }
    if (userNumber < minNumber) {
        // 参加者数が2人以下の場合
        await replyTooFewParticipant(plId, replyToken);
    } else {
        // 参加受付終了の意思表明に対するリプライ
        // 参加受付を終了した旨（TODO 参加者を変更したい場合はもう一度「参加者が」ゲーム名を発言するように言う）、参加者のリスト、該当ゲームの最初の設定のメッセージを送る
        await replyRollCallEnd(plId, replyToken);
    }
};

/**
 * eventがメッセージかつワードウルフがプレイ中で参加者の発言だった場合の分岐
 *
 * @param {*} plId
 * @param {*} text
 * @param {*} replyToken
 */
exports.playingMessageBranch = async (plId, text, replyToken) => {
    const wordWolf = new WordWolf(plId);

    const status = await wordWolf.getStatus();

    if (status == "setting") {
        const settingNames = await wordWolf.getGameSettingNames();
        const settingStatus = await wordWolf.getSettingStatus();
        const isSettingCompleted = await wordWolf.isSettingCompleted();
        if (!isSettingCompleted) {
            for (let i = 0; i < settingNames.length; i++) {
                if (!settingStatus[i]) {
                    if (settingNames[i] == "depth") {
                        if (text == 1 || text == 2 || text == 3 || text == 4 || text == 5) {
                            await replyDepthChosen(plId, text, replyToken);
                        }
                    }
                    if (settingNames[i] == "wolf_number") {
                        const wolfNumberExists = await wordWolf.wolfNumberExists(text); // ウルフの人数（"2人"など)が発言されたかどうか
                        if (wolfNumberExists) {
                            const wolfNumber = await wordWolf.getWolfNumberFromText(text); // textからウルフの人数(2など)を取得
                            await replyWolfNumberChosen(plId, wolfNumber, replyToken);
                        }
                    }
                    if (settingNames[i] == "lunatic_number") {


                        const lunaticNumberExists = await wordWolf.lunaticNumberExists(text);
                        if (lunaticNumberExists) {
                            // 狂人の人数が発言された場合

                            const lunaticNumber = await wordWolf.getLunaticNumberFromText(text);
                            await replyLunaticNumberChosen(plId, lunaticNumber, replyToken);
                        }
                    }
                    break;
                }
            }
        } else { // 設定項目がすべてtrueだったら
            if (text == "ゲームを開始する") {
                await replyConfirmYes(plId, replyToken);
            }
            if (text == "難易度変更") {
                await replyDepthChange(plId, replyToken);
            }
            if (text == "ウルフ人数変更") {
                await replyWolfNumberChange(plId, replyToken);
            }
            if (text == "狂人人数変更") {
                await replyLunaticNumberChange(plId, replyToken);
            }
            if (text == "議論時間変更") {
                await replyTimerChange(plId, replyToken);
            }
        }
    }

    if (status == "discuss") {
        // 話し合い中だった場合

        if (text == "終了") {
            await replyFinish(plId, replyToken);
        }

    }

    if (status == "winner") {
        // すべての結果発表がまだなら
        if (text == "ワードを見る") {
            await replyAnnounceResult(plId, replyToken);
        }
    }
};

/**
 * eventがpostbackかつワードウルフがプレイ中で参加者のポストバックイベントだった場合の分岐
 *
 * @param {*} plId
 * @param {*} userId
 * @param {*} postbackData
 * @param {*} replyToken
 */
exports.postbackPlayingBranch = async (plId, userId, postbackData, replyToken) => {
    const wordWolf = new WordWolf(plId);

    const status = await wordWolf.getStatus();
    if (status == "discuss") {
        if (postbackData == "残り時間") {
            await replyRemainingTime(plId, replyToken);
        }
    }

    if (status == "vote") {
        const userIndex = await wordWolf.getUserIndexFromUserId(userId);
        const voteState = await wordWolf.isVotedUser(userIndex);
        if (!voteState) {
            // postbackした参加者の投票がまだの場合

            const votedUserIndex = await wordWolf.getUserIndexFromUserId(
                postbackData
            ); // postbackDataがuserIdじゃなかったら-1がかえる
            const isUserCandidate = await wordWolf.isUserCandidate(votedUserIndex);
            if (isUserCandidate) {
                // postbackのデータが候補者のインデックスだった場合

                // ※
                if (userId != postbackData) {
                    // 自分以外に投票していた場合
                    await replyVoteSuccess(plId, postbackData, replyToken, userIndex);
                } else {
                    // 自分に投票していた場合
                    await replySelfVote(plId, replyToken, userIndex);
                }
            }
        } else {
            await replyDuplicateVote(plId, replyToken, userIndex);
        }
    }
};

exports.postbackDatetimeBranch = async (plId, userId, params, replyToken) => {
    const wordWolf = new WordWolf(plId);
    const status = await wordWolf.getStatus();
    if (status == "setting") {
        const settingNames = await wordWolf.getGameSettingNames();
        const settingStatus = await wordWolf.getSettingStatus();
        for (let i = 0; i < settingNames.length; i++) {
            if (!settingStatus[i]) {
                if (settingNames[i] == "timer") {
                    replyTimerChosen(plId, params, replyToken);
                }
            }
        }
    }
};

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

    const wordWolf = new WordWolf(plId);
    wordWolf.updateDefaultSettingStatus();

    const displayNames = await wordWolf.getDisplayNames(plId); // 参加者の表示名リスト

    // DB変更操作１
    await wordWolf
        .updateIsPlayingTrue()
        .then(await wordWolf.updateIsRecruitingFalse()); // 参加者リストをプレイ中にして、募集中を解除する

    // DB変更操作２
    await wordWolf.updateStatus("setting");

    await wordWolf.createWordWolfSetting(); // 設定テーブル作成

    return client.replyMessage(replyToken, await replyMessage.main(displayNames));
};

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

    return client.replyMessage(
        replyToken,
        await replyMessage.main(displayNames, userNumber, recruitingGameName)
    );
};

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
    await wordWolf
        .updateWordSetIdMatchGenreId(genreId)
        .then(wordWolf.updateGenreStatusTrue());

    const wolfNumberOptions = await wordWolf.getWolfNumberOptions();

    return client.replyMessage(
        replyToken,
        await replyMessage.main(genreName, wolfNumberOptions)
    );
};

// depth
const replyDepthChosen = async (plId, text, replyToken) => {
    const wordWolf = new WordWolf(plId);

    // DB変更操作１、２
    // ワードセットはランダムで選んでる

    const settingIndex = await wordWolf.getSettingIndex("depth");

    await wordWolf
        .updateWordSetIdMatchDepth(text)
        .then(await wordWolf.updateSettingStateTrue(settingIndex));

    const isSettingCompleted = await wordWolf.isSettingCompleted();
    if (!isSettingCompleted) {
        // 設定が完了していなかったら
        const replyMessage = require("../template/messages/word_wolf/replyGenreChosen");

        const wolfNumberOptions = await wordWolf.getWolfNumberOptions();
        return client.replyMessage(
            replyToken,
            await replyMessage.main(text, wolfNumberOptions)
        );
    } else {
        replyConfirm(plId, replyToken);
    }
};

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
    const wordWolf = new WordWolf(plId);

    const settingIndex = await wordWolf.getSettingIndex("wolf_number");

    //ウルフ番号データを挿入できたらステータスをtrueにする
    await wordWolf
        .updateWolfIndexes(wolfNumber)
        .then(await wordWolf.updateSettingStateTrue(settingIndex));

    const isSettingCompleted = await wordWolf.isSettingCompleted();
    if (!isSettingCompleted) {
        const replyMessage = require("../template/messages/word_wolf/replyWolfNumberChosen");
        const lunaticNumberOptions = await wordWolf.getLunaticNumberOptions();

        return client.replyMessage(
            replyToken,
            await replyMessage.main(wolfNumber, lunaticNumberOptions)
        );
    } else {
        replyConfirm(plId, replyToken);
    }
};

/**
 * 狂人の人数が選ばれたときのリプライ
 *
 * @param {*} plId
 * @param {*} lunaticNumber
 * @param {*} replyToken
 * @returns
 */
const replyLunaticNumberChosen = async (plId, lunaticNumber, replyToken) => {
    const wordWolf = new WordWolf(plId);
    const settingIndex = await wordWolf.getSettingIndex("lunatic_number");

    //狂人番号データを挿入できたらステータスをtrueにする
    await wordWolf
        .updateLunaticIndexes(lunaticNumber)
        .then(await wordWolf.updateSettingStateTrue(settingIndex));

    const isSettingCompleted = await wordWolf.isSettingCompleted();
    if (!isSettingCompleted) {
        const replyMessage = require("../template/messages/word_wolf/replyLunaticNumberChosen");
    } else {
        replyConfirm(plId, replyToken);
    }
};

const replyTimerChosen = async (plId, params, replyToken) => {
    const wordWolf = new WordWolf(plId);

    const settingIndex = await wordWolf.getSettingIndex("timer");

    const timerArray = params.time.split(":");
    const timerData = `${timerArray[0]} minutes ${timerArray[1]} seconds`;
    await wordWolf
        .updateTimer(timerData)
        .then(await wordWolf.updateSettingStateTrue(settingIndex));

    const isSettingCompleted = await wordWolf.isSettingCompleted();
    if (!isSettingCompleted) {
    } else {
        replyConfirm(plId, replyToken);
    }
};

const replyConfirm = async (plId, replyToken) => {
    const wordWolf = new WordWolf(plId);
    const replyMessage = require("../template/messages/word_wolf/replyChanged");

    const userNumber = await wordWolf.getUserNumber();
    const depth = await wordWolf.getDepth();
    const wolfNumber = await wordWolf.getWolfNumber();
    const lunaticNumber = await wordWolf.getLunaticNumber();
    const timer = await wordWolf.getTimerString();

    return client.replyMessage(
        replyToken,
        await replyMessage.main(userNumber, depth, wolfNumber, lunaticNumber, timer)
    );
};

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
    await wordWolf.updateStatus("discuss");
    await wordWolf.createDiscuss(); // 話し合い時間に関する設定を挿入

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

    for (let i = 0; i < userNumber; i++) {
        // プッシュメッセージ数節約のため開発時は一時的に無効化
        client.pushMessage(
            userIds[i],
            await pushMessage.main(profiles[i], userWords[i], isLunatic[i])
        );
    }

    const timer = await wordWolf.getTimerString(); // タイマー設定を取得

    return client.replyMessage(replyToken, await replyMessage.main(timer));
};

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
    return client.replyMessage(replyToken, await replyMessage.main());
};

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
    const replyMessage = require("../template/messages/word_wolf/replyFinish");

    return client.replyMessage(
        replyToken,
        await replyMessage.main(displayNames, userIds)
    );

};

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

    return client.replyMessage(
        replyToken,
        await replyMessage.main(remainingTime)
    );
};

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
};

const replyNotifyAndRemainingTime = async (plId, replyToken) => {
    const replyMessage = require("../template/messages/word_wolf/replyNotifyAndRemainingTime");
    const wordWolf = new WordWolf(plId);

    const remainingTime = await wordWolf.getRemainingTime();
    await wordWolf.updateNotifyStatusTrue();

    return client.replyMessage(
        replyToken,
        await replyMessage.main(remainingTime)
    );
};

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
    const voterDisplayName = await wordWolf.getDisplayName(userIndex);

    // DB変更操作１，２
    // 投票ユーザーの投票状況をtrueにできたら得票ユーザーの得票数を+1する同期処理
    const votedUserIndex = await wordWolf.getUserIndexFromUserId(postbackData);
    await wordWolf
        .updateVoteState(userIndex)
        .then(await wordWolf.updateVoteNumber(votedUserIndex));

    const isVoteCompleted = await wordWolf.isVoteCompleted();
    if (isVoteCompleted) {
        const multipleMostVotedUserExists = await wordWolf.multipleMostVotedUserExists();
        if (!multipleMostVotedUserExists) {
            // 最多得票者が一人だった場合

            const replyMessage = require("../template/messages/word_wolf/replyAnnounceWinner");
            const mostVotedUserIndex = await wordWolf.getMostVotedUserIndex(); // 最多得票者＝処刑者
            const executorDisplayName = await wordWolf.getDisplayName(mostVotedUserIndex);
            const isExecutorWolf = await wordWolf.isUserWolf(mostVotedUserIndex); // 処刑者がウルフかどうか

            await wordWolf.updateStatus("winner"); // 勝者発表状況をtrueにする
            if(isExecutorWolf){
                wordWolf.updateWinner("citizen");
            }else{
                wordWolf.updateWinner("wolf");
            }
            const displayNames = await wordWolf.getDisplayNames();
            const isWinnerArray = await wordWolf.isWinnerArray(isExecutorWolf);

            return client.replyMessage(
                replyToken,
                await replyMessage.main(
                    voterDisplayName,
                    executorDisplayName,
                    isExecutorWolf,
                    displayNames,
                    isWinnerArray
                )
            );
        } else {
            // 最多得票者が複数いた場合
            const mostVotedUserIndexes = await wordWolf.getMostVotedUserIndexes(); // 最多得票者の配列
            const isRevoting = (await wordWolf.getVoteCount()) > 1;
            if (!isRevoting) {
                // 一回目の投票の場合

                const replyMessage = require("../template/messages/word_wolf/replyRevote");

                // DB変更操作３’，４’
                // 再投票データを作成したら、投票データを初期化する同期処理
                await wordWolf.createRevote(mostVotedUserIndexes);

                const displayNames = await wordWolf.getDisplayNames();
                const userIds = await wordWolf.getUserIds();
                return client.replyMessage(
                    replyToken,
                    await replyMessage.main(
                        voterDisplayName,
                        displayNames,
                        userIds,
                        mostVotedUserIndexes
                    )
                );
            } else {
                const replyMessage = require("../template/messages/word_wolf/replyAnnounceWinnerInRevote");
                const executorIndex = await wordWolf.chooseExecutorIndex(); // 処刑者をランダムで決定
                const executorDisplayName = await wordWolf.getDisplayName(
                    executorIndex
                );
                const isExecutorWolf = await wordWolf.isUserWolf(executorIndex); // 処刑者がウルフかどうか

                await wordWolf.updateStatus("winner");
                if(isExecutorWolf){
                    wordWolf.updateWinner("citizen");
                }else{
                    wordWolf.updateWinner("wolf");
                }
                const displayNames = await wordWolf.getDisplayNames();
                const isWinnerArray = await wordWolf.isWinnerArray(isExecutorWolf);

                return client.replyMessage(
                    replyToken,
                    await replyMessage.main(
                        voterDisplayName,
                        executorDisplayName,
                        isExecutorWolf,
                        displayNames,
                        isWinnerArray
                    )
                );
            }
        }
    } else {
        const replyMessage = require("../template/messages/word_wolf/replyVoteSuccess");
        return client.replyMessage(
            replyToken,
            await replyMessage.main(voterDisplayName)
        );
    }
};

const replySelfVote = async (plId, replyToken, userIndex) => {
    const replyMessage = require("../template/messages/word_wolf/replySelfVote");
    const wordWolf = new WordWolf(plId);
    const displayNames = await wordWolf.getDisplayNames();
    const displayName = displayNames[userIndex];
    return client.replyMessage(replyToken, await replyMessage.main(displayName));
};

const replyDuplicateVote = async (plId, replyToken, userIndex) => {
    const replyMessage = require("../template/messages/word_wolf/replyDuplicateVote");
    const wordWolf = new WordWolf(plId);
    const displayNames = await wordWolf.getDisplayNames();
    const displayName = displayNames[userIndex];
    return client.replyMessage(replyToken, await replyMessage.main(displayName));
};

const replyAnnounceResult = async (plId, replyToken) => {
    const replyMessage = require("../template/messages/word_wolf/replyAnnounceResult");
    const wordWolf = new WordWolf(plId);

    const displayNames = await wordWolf.getDisplayNames();
    const wolfIndexes = await wordWolf.getWolfIndexes();
    const lunaticIndexes = await wordWolf.getLunaticIndexes();

    const citizenWord = await wordWolf.getCitizenWord();
    const wolfWord = await wordWolf.getWolfWord();

    await wordWolf.updateStatus("result");
    await wordWolf.finishParticipantList();
    const winner = await wordWolf.getWinner();

    return client.replyMessage(
        replyToken,
        await replyMessage.main(
            displayNames,
            wolfIndexes,
            lunaticIndexes,
            citizenWord,
            wolfWord,
            winner
        )
    );
};

const replyDepthChange = async (plId, replyToken) => {
    const replyMessage = require("../template/messages/word_wolf/replyDepthChange");
    const wordWolf = new WordWolf(plId);

    const index = await wordWolf.getSettingIndex("depth");
    wordWolf.updateSettingStateFalse(index); // 設定状態をfalseに
    return client.replyMessage(replyToken, await replyMessage.main());
};

const replyWolfNumberChange = async (plId, replyToken) => {
    const replyMessage = require("../template/messages/word_wolf/replyWolfNumberChange");
    const wordWolf = new WordWolf(plId);

    const index = await wordWolf.getSettingIndex("wolf_number");
    wordWolf.updateSettingStateFalse(index); // 設定状態をfalseに

    const wolfNumberOptions = await wordWolf.getWolfNumberOptions();
    return client.replyMessage(replyToken, await replyMessage.main(wolfNumberOptions));
};

const replyLunaticNumberChange = async (plId, replyToken) => {
    const replyMessage = require("../template/messages/word_wolf/replyLunaticNumberChange");
    const wordWolf = new WordWolf(plId);

    const index = await wordWolf.getSettingIndex("lunatic_number");
    wordWolf.updateSettingStateFalse(index); // 設定状態をfalseに

    const lunaticNumberOptions = await wordWolf.getLunaticNumberOptions();
    return client.replyMessage(replyToken, await replyMessage.main(lunaticNumberOptions));
};

const replyTimerChange = async (plId, replyToken) => {
    const replyMessage = require("../template/messages/word_wolf/replyTimerChange");
    const wordWolf = new WordWolf(plId);

    const index = await wordWolf.getSettingIndex("timer");
    wordWolf.updateSettingStateFalse(index); // 設定状態をfalseに
    return client.replyMessage(replyToken, await replyMessage.main());
};
