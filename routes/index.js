const express = require('express');
const router = express.Router();
const line = require("@line/bot-sdk");

const ParticipantList = require("../services/ParticipantList");
const PlayingGame = require("../services/PlayingGame");
const WordWolf = require("../services/word_wolf/WordWolf");

const replyWordWolf = require("../services/word_wolf/replyWordWolf");


const config = {
  channelAccessToken: process.env.channelAccessToken,
  channelSecret: process.env.channelSecret
};

const client = new line.Client(config);


/** 
 * Webhookルーティング部分
 */

router.post('/', (req, res, next) => {
  // res.render('index', { title: 'Express' });
  lineBot(req, res);
});


/**
 * Webhook処理のメイン関数
 *
 * @param {*} req
 * @param {*} res
 */

const lineBot = async (req, res) => {
  res.status(200).end(); // 先に200を返してあげる

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
        const groupId = event.source.groupId;
        if (text == "ワードウルフ") {
          promises.push(replyRollCall(event));
          continue;
        }
        const isRecruiting = await pl.hasGroupRecruitingParticipantList(groupId);
        if (isRecruiting) { // 参加者募集中の場合
          if (text == "参加") {
            promises.push(replyRollCallReaction(event));
            continue;
          }
          const plId = await pl.readRecruitingParticipantListId(groupId); // 募集中の参加者リストのidを取得
          const isUserParticipant = await pl.isUserParticipant(plId, userId); // 発言ユーザーが参加者かどうか
          if (isUserParticipant) { // 参加受付を終了できるのは参加済みの者のみ
            if (text == "参加受付終了") {
              promises.push(replyRollCallEnd(event));
              continue;
            }
          }
        }

        const isPlaying = await pl.hasGroupPlayingParticipantList(groupId);
        if (isPlaying) {
          const plId = await pl.readPlayingParticipantListId(groupId);
          const isUserParticipant = await pl.isUserParticipant(plId, userId); // 発言ユーザーが参加者かどうか
          if (isUserParticipant) {
            const playingGame = new PlayingGame(plId);
            const gameId = await playingGame.readGameId();
            if (gameId == 1) {
              const wordWolf = new WordWolf(plId);
              const genreStatus = await wordWolf.readGenreStatus();
              if (!genreStatus) {
                const genreNameExists = await wordWolf.genreNameExists(text);
                if (genreNameExists) {
                  const genreId = await wordWolf.readGenreIdFromName(text);
                  console.log("genreId:" + genreId);
                  promises.push(replyWordWolf.replyChooseGenre(plId, genreId, replyToken));
                  continue;
                }
              } else {
                const wolfNumberStatus = await wordWolf.readWolfNumberStatus();
                if (!wolfNumberStatus) {
                  if (text == "はい！") {
                    const wolfNumber = 1;
                    promises.push(replyWordWolf.replyChooseWolfNumber(plId, wolfNumber, replyToken));
                    continue;
                  }
                } else {
                  const confirmStatus = await wordWolf.readConfirmStatus();
                  if (!confirmStatus) {
                    if (text == "はい！") {
                      promises.push(replyWordWolf.replyConfirm(plId, replyToken));
                      continue;
                    }
                  } else {
                    const finishedStatus = await wordWolf.readFinishedStatus();
                    if (!finishedStatus) {
                      if (text == "終了") { //TODO 参加者が言わないと無効
                        promises.push(replyWordWolf.replyFinish(plId, replyToken));
                        continue;
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
          const plId = await pl.readPlayingParticipantListId(groupId);
          const isUserParticipant = await pl.isUserParticipant(plId, userId);
          if (isUserParticipant) {
            const playingGame = new PlayingGame(plId);
            const gameId = await playingGame.readGameId();
            if (gameId == 1) {
              const wordWolf = new WordWolf(plId);
              const finishedStatus = await wordWolf.readFinishedStatus();
              if (finishedStatus) {
                const resultStatus = await wordWolf.readResultStatus();
                if (!resultStatus) {

                  const userIndex = await pl.readUserIndexFromUserId(plId, userId);
                  const voteState = await wordWolf.readVoteState(userIndex);

                  if (!voteState) {
                    if (userIndex != postbackData) {
                      wordWolf.updateVoteStatus(userIndex).then(wordWolf.updateVoteNumber(postbackData).then(promises.push(replyWordWolf.replyVoteSuccess(plId, replyToken, userIndex))));
                      continue;
                    } else {
                      promises.push(replyWordWolf.replySelfVote(plId, replyToken, userIndex));
                    }
                  } else {
                    promises.push(replyWordWolf.replyDuplicateVote(plId, replyToken, userIndex));
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
 * グループへのデフォルトリプライ
 *
 * @param {*} event
 * @returns
 */

const replyDefaultGroupMessage = async (event) => {
  // const userIds = await pl.readUserIds(event);

  const profiles = await readDisplayNames(userIds);

  const name = profiles.join('さん、');
  return client.replyMessage(event.replyToken, [
    {
      type: "text",
      text: `${name}さんおはようございます！`
      // text: `${pro.displayName}さん、今「${event.message.text}」って言いました？\n${pro.statusMessage}`
    },
    // {
    //   type: "text",
    //   text: `${event.source.groupId}`
    // }
  ])
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
      text: `${pro.displayName}さん、今「${event.message.text}」って言いました？\n${pro.statusMessage}`
    }
  ])
}


/**
 * 参加受付用リプライ
 * グループをparticipant_listに登録する
 * TODO 友達追加されてなかった場合はプレイヤー1などとする
 *
 * @param {*} pl
 * @returns
 */

const replyRollCall = async (event) => {
  const replyMessage = require("../template/massages/replyRollCall");
  const pl = new ParticipantList();

  let messageText = "";
  let pro = null;

  const groupId = event.source.groupId;
  const userId = event.source.userId;

  pl.updateIsPlayingOfGroupFalse(groupId); // 参加者募集の前に以前の発言グループのプレイ中を解除
  await pl.updateIsRecruitingOfGroupFalse(groupId); // 募集中も解除
  pro = await client.getProfile(event.source.userId);

  messageText = "ワードウルフへの参加を募集します！";

  await pl.createPaticipantList(groupId, userId).then(client.replyMessage(event.replyToken, await replyMessage.main(messageText, pro)));

}


/**
 * 参加受付リアクション用のリプライ
 *
 * @param {*} event
 * @returns
 */

const replyRollCallReaction = async (event) => {
  const replyMessage = require("../template/massages/replyRollCallReaction");
  const pl = new ParticipantList();

  let messageText = "";
  const pro = await client.getProfile(event.source.userId);
  const name = pro.displayName;

  const groupId = event.source.groupId;
  const userId = event.source.userId;

  const plId = await pl.readRecruitingParticipantListId(groupId);

  if (await pl.isUserParticipant(plId, userId)) {
    messageText = name + "さんは参加済みです"
  } else {
    await pl.addUserToPaticipantList(plId, userId); // ユーザーを参加者リストに追加

    messageText = name + "さんを確認しました！";
  }


  const profiles = await pl.readDisplayNames(plId);
  const names = profiles.join('さん、\n');

  return client.replyMessage(event.replyToken, await replyMessage.main(messageText, names));
}


/**
 * 参加受付を終了する
 *
 * @param {*} pl
 * @returns
 */

const replyRollCallEnd = async (event) => {
  const replyMessage = require("../template/massages/replyRollCallEnd");
  const pl = new ParticipantList();

  const groupId = event.source.groupId;
  const plId = await pl.readRecruitingParticipantListId(groupId);
  console.log("plId: " + plId);
  const profiles = await pl.readDisplayNames(plId);
  const names = profiles.join('さん、\n');

  const playingGame = new PlayingGame(plId);
  playingGame.createPlayingGame(1).then(pl.updateIsPlayingTrue(plId).then(pl.updateIsRecruitingFalse(plId)));
  playingGame.createWordWolfStatus();

  const wordWolf = new WordWolf(plId);
  const genres = await wordWolf.readAllGenreIdAndName();

  return client.replyMessage(event.replyToken, await replyMessage.main(names, genres));
}


/**
 * joinのPromise
 *
 * @param {*} array
 * @param {*} text
 * @returns
 */

const joinPromise = async (array, text) => {
  const name = await array.join(text);
  return name;
}


module.exports = router;
