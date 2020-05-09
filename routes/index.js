const express = require('express');
const router = express.Router();
const line = require("@line/bot-sdk");

const ParticipantList = require("../services/ParticipantList");
const PlayingGroup = require("../services/PlayingGroup");

const config = {
  channelAccessToken: process.env.channelAccessToken,
  channelSecret: process.env.channelSecret
};

const client = new line.Client(config);


/** 
 * Webhookルーティング部分
 */

router.post('/webhook/', (req, res, next) => {
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
    const pl = new ParticipantList(event);

    const status = await pl.participantListExists();
    const text = pl.event.message.text;
    const type = pl.event.source.type;
    if (type == "group") {
      if (text == "点呼") {
        promises.push(replyRollCall(pl));
      }
      if (status) { // 参加者募集中の場合
        if (text == "元気です") {
          promises.push(replyRollCallReaction(pl));
        } else if (text == "点呼終了") {
          promises.push(replyRollCallEnd(pl));
        }
      }

      // promises.push(replyDefaultGroupMessage(event));

    } else if (type == "user") {
      promises.push(replyDefaultPersonalMessage(event));
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
  const userIds = await pl.readParticipantList(event);

  const profiles = await readProfiles(userIds);

  const name = await joinPromise(profiles, 'さん、');
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
  await viewSource(event);

  return client.replyMessage(event.replyToken, [
    {
      type: "text",
      text: `${pro.displayName}さん、今「${event.message.text}」って言いました？\n${pro.statusMessage}`
    }
  ])
}


/**
 * 点呼用リプライ
 * グループをparticipant_listに登録する
 *
 * @param {*} event
 * @returns
 */

const replyRollCall = async (pl) => {
  const message = require("../template/massages/replyRollCall");
  const pro = await client.getProfile(pl.event.source.userId).then().catch("プロフィール取ってこれんかった");

  const status = await pl.createPaticipantList();
  let messageText = "";
  if (status) {
    messageText = "点呼をとります！";
  } else {
    messageText = "点呼をとれません";
  }

  return client.replyMessage(pl.event.replyToken, await message.main(messageText,pro))
}




/**
 * 点呼リアクション用のリプライ
 *
 * @param {*} event
 * @returns
 */

const replyRollCallReaction = async (pl) => {
  const message = require("../template/massages/replyRollCallReaction");
  let messageText = "";
  const pro = await client.getProfile(pl.event.source.userId);
  const name = pro.displayName;

  if (await pl.userExistsInParticipantList()) {
    messageText = name + "さんは点呼完了済みです"
  } else {
    const status = await pl.addPaticipantList();
    if (status) {
      messageText = name + "さん確認しました！";
    } else {
      messageText = name + "さんを確認できませんでした";
    }
  }

  const profiles = await pl.readProfiles();
  const names = await joinPromise(profiles, "さん\n");

  return client.replyMessage(pl.event.replyToken, await message.main(messageText,names));
}

/**
 * 点呼を終了する
 *
 * @param {*} pl
 * @returns
 */
const replyRollCallEnd = async (pl) => {
  const message = require("../template/massages/replyRollCallEnd");

  const plId = pl.readParticipantListId();
  const profiles = await pl.readProfiles();
  const names = await joinPromise(profiles, "さん\n");

  await pl.disablePreviousParticipantList();

  // const playingGroup = new PlayingGroup(plId,1);
  // playingGroup.createPlayingGroup();

  return client.replyMessage(pl.event.replyToken, await message.main(names));
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
