const express = require('express');
const router = express.Router();
const line = require("@line/bot-sdk");

const ParticipantList = require("../classes/ParticipantList");
const PlayingGame = require("../classes/PlayingGame");
const WordWolf = require("../classes/WordWolf");
const Game = require("../classes/Game")

const wordWolfBranch = require("./wordWolfBranch");


const config = {
  channelAccessToken: process.env.channelAccessToken,
  channelSecret: process.env.channelSecret
};

const client = new line.Client(config);


/** 
 * Webhookルーティング部分
 */

router.post('/', (req, res, next) => {
  main(req, res);
});


/**
 * Webhook処理のメイン関数
 *
 * @param {*} req
 * @param {*} res
 */

const main = async (req, res) => {
  res.status(200).end(); // 先に200を返してあげる

  // イベント内容をコンソールに表示
  console.log(req.body.events);


  const events = req.body.events;
  const promises = [];
  for (const event of events) {
    const eventType = event.type;
    const pl = new ParticipantList();
    const userId = event.source.userId;
    const replyToken = event.replyToken;

    if (eventType == "message") {

      const text = event.message.text;
      const toType = event.source.type;

      if (toType == "group") {
        // TODO 友達追加されていないユーザーの場合の分岐

        const groupId = event.source.groupId;

        const game = new Game();
        const gameNameExists = await game.gameNameExists(text);
        if (gameNameExists) {
          const gameId = await game.getGameIdFromName(text);

          const isRestarting = await pl.hasGroupRestartingParticipantList(groupId);
          const isRecruiting = await pl.hasGroupRecruitingParticipantList(groupId);
          const isPlaying = await pl.hasGroupPlayingParticipantList(groupId);
          if (isRestarting) {
            // ここの内容は※マークのところと同じになるように
            // 本当は統合したいが条件分岐がぐちゃぐちゃになる

            promises.push(replyRollCall(groupId, gameId, replyToken));
            continue;
          } else if (isRecruiting) {

            // 参加者募集中のゲームがあるが新しくゲームの参加者を募集するかどうかを聞く旨のリプライを返す
            const plId = await pl.getRecruitingParticipantListId(groupId); // 募集中の参加者リストのidを取得
            promises.push(replyRestartConfirmIfRecruiting(plId, gameId, replyToken));
            continue;

          } else if (isPlaying) {

            const plId = await pl.getPlayingParticipantListId(groupId);
            const isUserParticipant = await pl.isUserParticipant(plId, userId); // 発言ユーザーが参加者かどうか
            if (isUserParticipant) { // 参加者の発言の場合

              // プレイ中のゲームがあるが新しくゲームの参加者を募集するかどうかを聞く旨のリプライを返す
              promises.push(replyRestartConfirmIfPlaying(plId, gameId, replyToken));
              continue;
            }

          } else {
            // ※
            // 参加を募集する旨のリプライを返す
            promises.push(replyRollCall(groupId, gameId, replyToken));
            continue;
          }
        } else { // 発言の内容がゲーム名じゃないなら
          await pl.updateIsRestartingOfGroupFalse(groupId); // 発言グループのリスタート待ちを解除

          // 発言グループに募集中の参加者リストがあるかどうか
          const isRecruiting = await pl.hasGroupRecruitingParticipantList(groupId);
          if (isRecruiting) { // 参加者募集中の場合
            const plId = await pl.getRecruitingParticipantListId(groupId); // 発言グループの募集中の参加者リストを返す

            if (text == "参加") {
              // 参加意思表明に対するリプライ
              // 参加を受け付けた旨、現在の参加者のリスト、参加募集継続中の旨を送る
              promises.push(replyRollCallReaction(plId, userId, replyToken));
              continue;
            }

            const isUserParticipant = await pl.isUserParticipant(plId, userId); // 発言ユーザーが参加者かどうか
            if (isUserParticipant) { // 参加受付を終了できるのは参加済みの者のみ

              if (text == "参加受付終了") {
                const playingGame = new PlayingGame(plId);
                const gameId = await playingGame.getGameId();
                if (gameId == 1) { // ワードウルフの場合

                  await wordWolfBranch.rollCallBranch(plId,replyToken,promises);
                  continue;
                  /* 
                  const userNumber = await pl.getUserNumber(plId); // 
                  if (userNumber < 3) { // 参加者数が2人以下の場合
                    promises.push(wordWolfBranch.replyTooFewParticipant(plId, replyToken));
                    continue;
                  } else {
                    // 参加受付終了の意思表明に対するリプライ
                    // 参加受付を終了した旨（TODO 参加者を変更したい場合はもう一度「参加者が」ゲーム名を発言するように言う）、参加者のリスト、該当ゲームの最初の設定のメッセージを送る
                    promises.push(replyRollCallEnd(plId, replyToken));
                    continue;
                  }
                  */
                }
              }
            }
          }

          // 発言グループにプレイ中の参加者リストがあるかどうか（参加受付終了した時点で募集中からプレイ中に変更してある）
          const isPlaying = await pl.hasGroupPlayingParticipantList(groupId);
          if (isPlaying) {　// プレイ中の場合

            const plId = await pl.getPlayingParticipantListId(groupId);
            const isUserParticipant = await pl.isUserParticipant(plId, userId); // 発言ユーザーが参加者かどうか
            if (isUserParticipant) { // 参加者の発言の場合

              const playingGame = new PlayingGame(plId);
              const gameId = await playingGame.getGameId();
              if (gameId == 1) { // プレイするゲームがワードウルフの場合

                // ここから設定状況確認に入る
                const wordWolf = new WordWolf(plId);
                const genreStatus = await wordWolf.getGenreStatus();
                if (!genreStatus) { // ジャンルがまだ指定されてない場合

                  const genreNameExists = await wordWolf.genreNameExists(text); // 存在するジャンルの名前が発言されたかどうか
                  if (genreNameExists) { // ジャンルの名前が発言された場合
                    const genreId = await wordWolf.getGenreIdFromName(text); // 名前からジャンルのidをとってくる
                    console.log("genreId:" + genreId);
                    // ジャンル選択後のリプライ
                    promises.push(wordWolfBranch.replyGenreChosen(plId, genreId, replyToken));
                    continue;
                  }
                } else { // ジャンルが選択済みの場合

                  const wolfNumberStatus = await wordWolf.getWolfNumberStatus();
                  if (!wolfNumberStatus) { // ウルフの人数がまだ指定されてない場合

                    const wolfNumberExists = await wordWolf.wolfNumberExists(text); // ウルフの人数（"2人"など)が発言されたかどうか
                    if (wolfNumberExists) {

                      const wolfNumber = await wordWolf.getWolfNumberFromText(text); // textからウルフの人数(2など)を取得
                      console.log("wolfNumber:" + wolfNumber);
                      promises.push(wordWolfBranch.replyWolfNumberChosen(plId, wolfNumber, replyToken));
                      continue;
                    }
                  } else {
                    const settingConfirmStatus = await wordWolf.getSettingConfirmStatus();
                    if (!settingConfirmStatus) {
                      if (text == "はい！") {
                        promises.push(wordWolfBranch.replyConfirm(plId, replyToken));
                        continue;
                      }
                    } else {
                      const finishedStatus = await wordWolf.getFinishedStatus();
                      if (!finishedStatus) {
                        if (text == "終了") { //TODO 参加者が言わないと無効
                          promises.push(wordWolfBranch.replyFinish(plId, replyToken));
                          continue;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        // promises.push(replyDefaultGroupMessage(event));

      } else if (toType == "user") {
        promises.push(replyDefaultPersonalMessage(event));
      }


    } else if (eventType == "postback") {
      const toType = event.source.type;

      if (toType == "group") {
        const groupId = event.source.groupId;
        const isPlaying = pl.hasGroupPlayingParticipantList(groupId);
        const postbackData = event.postback.data;
        if (isPlaying) {
          const plId = await pl.getPlayingParticipantListId(groupId);
          const isUserParticipant = await pl.isUserParticipant(plId, userId);
          if (isUserParticipant) {
            const playingGame = new PlayingGame(plId);
            const gameId = await playingGame.getGameId();
            if (gameId == 1) {
              const wordWolf = new WordWolf(plId);
              const finishedStatus = await wordWolf.getFinishedStatus();
              if (finishedStatus) {
                const resultStatus = await wordWolf.getResultStatus();
                if (!resultStatus) {

                  const userIndex = await pl.getUserIndexFromUserId(plId, userId);
                  const voteState = await wordWolf.getVoteState(userIndex);

                  if (!voteState) {
                    if (userIndex != postbackData) {
                      wordWolf.updateVoteStatus(userIndex).then(wordWolf.updateVoteNumber(postbackData).then(promises.push(wordWolfBranch.replyVoteSuccess(plId, replyToken, userIndex))));
                      continue;
                    } else {
                      promises.push(wordWolfBranch.replySelfVote(plId, replyToken, userIndex));
                    }
                  } else {
                    promises.push(wordWolfBranch.replyDuplicateVote(plId, replyToken, userIndex));
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  Promise.all(promises).then(console.log("pass")).catch(err => console.log(err));
}



/**
 * 個チャのデフォルトリプライ
 *
 * @param {*} event
 * @returns
 */

const replyDefaultPersonalMessage = async (event) => {
  const pro = await client.getProfile(event.source.userId);
  // await viewSource(event);

  return client.replyMessage(event.replyToken, [
    {
      type: "text",
      text: `${pro.displayName}さん、今「${event.message.text}」って言いました？`
    }
  ])
}



/**
 * 参加受付用リプライ
 * 
 * DB変更操作は以下の通り
 * １．発言グループの参加者リストの募集中、プレイ中を解除
 * ２．participant_listテーブルにデータを挿入
 * ３．遊ぶゲームをgameテーブルに追加
 * 
 * TODO 友達追加されてなかった場合はプレイヤー1などとする いや無理かこれは
 *
 * @param {*} groupId
 * @param {*} gameId
 * @param {*} replyToken
 */
const replyRollCall = async (groupId, gameId, replyToken) => {
  const replyMessage = require("../template/messages/replyRollCall");
  const pl = new ParticipantList();

  // DB変更操作１
  await pl.updateIsPlayingOfGroupFalse(groupId); // 参加者募集の前に以前の発言グループのプレイ中を解除
  await pl.updateIsRecruitingOfGroupFalse(groupId); // 募集中も解除

  // DB変更操作２
  await pl.createPaticipantList(groupId);
  const plId = await pl.getRecruitingParticipantListId(groupId);

  // DB変更操作３
  const playingGame = new PlayingGame(plId);
  await playingGame.createPlayingGame(gameId); // playing_gameテーブルに今から遊ぶゲームのidを入れる
  const gameName = await playingGame.getGameName();


  client.replyMessage(replyToken, await replyMessage.main(gameName));

}


/**
 * 参加意思表明に対するリプライ
 * 
 * DB変更操作は以下の通り
 * １．ユーザーが参加済みでない場合、参加者リストに追加
 *
 * @param {*} plId
 * @param {*} userId
 * @param {*} replyToken
 * @returns
 */
const replyRollCallReaction = async (plId, userId, replyToken) => {
  const replyMessage = require("../template/messages/replyRollCallReaction");
  const pl = new ParticipantList();

  const recruitingGame = new PlayingGame(plId);
  const recruitingGameName = await recruitingGame.getGameName();

  const profile = await client.getProfile(userId);
  const displayName = profile.displayName;

  const isUserParticipant = await pl.isUserParticipant(plId, userId); // ユーザーが参加者リストにいるかどうか

  // DB変更操作１
  if (!isUserParticipant) {
    await pl.addUserToPaticipantList(plId, userId)
  }

  const displayNames = await pl.getDisplayNames(plId); // 参加者リストのユーザー全員の表示名の配列

  console.log("displayNames: " + displayNames)

  return client.replyMessage(replyToken, await replyMessage.main(recruitingGameName, displayName, isUserParticipant, displayNames));
}


/**
 * 参加募集中にゲーム名が発言された際のリプライ
 * 
 * DB変更操作は以下の通り
 * １．参加者リストをリスタート待ちにする
 *
 * @param {*} plId
 * @param {*} gameId
 * @param {*} replyToken
 */
const replyRestartConfirmIfRecruiting = async (plId, gameId, replyToken) => {
  const replyMessage = require("../template/messages/replyRestartConfirmIfRecruiting");
  const pl = new ParticipantList();
  const recruitingGame = new PlayingGame(plId);
  const newGame = new Game();

  // DB変更操作１
  await pl.updateIsRestartingTrue(plId); // 参加者リストをリスタート待ちにする

  const recruitingGameName = await recruitingGame.getGameName();
  const newGameName = await newGame.getGameName(gameId);

  // 一応newGameNameも渡すがまだ使ってない
  // TODO is_restartingをrestart_game_idに変更する
  return client.replyMessage(replyToken, await replyMessage.main(recruitingGameName, newGameName));
}

/**
 * プレイ中にゲーム名が発言された際のリプライ
 * 
 * DB変更操作は以下の通り
 * １．参加者リストをリスタート待ちにする
 *
 * @param {*} plId
 * @param {*} gameId
 * @param {*} replyToken
 * @returns
 */
const replyRestartConfirmIfPlaying = async (plId, gameId, replyToken) => {
  const replyMessage = require("../template/messages/replyRestartConfirmIfPlaying");
  const pl = new ParticipantList();
  const playingGame = new PlayingGame(plId);
  const newGame = new Game();

  // DB変更操作１
  await pl.updateIsRestartingTrue(plId); // 参加者リストをリスタート待ちにする

  const playingGameName = await playingGame.getGameName();
  const newGameName = await newGame.getGameName(gameId);

  // 一応newGameNameも渡すがまだ使ってない
  return client.replyMessage(replyToken, await replyMessage.main(playingGameName, newGameName));
}


module.exports = router;
