const express = require('express');
const router = express.Router();
const line = require("@line/bot-sdk");
const request = require('request');

const PlayingGame = require("../classes/PlayingGame");

const config = {
    channelAccessToken: process.env.channelAccessToken,
    channelSecret: process.env.channelSecret
};

const client = new line.Client(config);

router.use(function (req, res, next) {
    /* リクエストに含まれるHostヘッダーを取得. */
    var hostname = req.headers.host;

    if (hostname == null || hostname == undefined) {
        /*
         * HostヘッダーはHTTP1.1では必須なので
         * ない場合は400にする.
         */
        res.send(400);
        return;
    }

    /*
     * Hostがlocalhostへのアクセスだったらリクエストを処理する.
     *
     * Hostがlocalhostへのアクセスで無い場合.
     * 例えば127.0.0.1などIPアドレス直打ちの場合は400を返して終了する.
     * 下のapp.get()は処理されない
     */
    if (hostname.match(/^localhost/) != null) {
        next();
    } else {
        res.send(400);
    }
})

// playing_gameテーブルの情報を返す
router.get('/:id', async (req, res, next) => {
    const plId = req.params.id;
    const playingGame = new PlayingGame(plId);
    const exists = await playingGame.exists(plId);
    if (!exists) {
        res.send(404);
    } else {
        const gameId = await playingGame.getGameId();
        const status = await playingGame.getStatus();
        const day = await playingGame.getDay();
        const settingStatus = await playingGame.getSettingStatus();
        const timer = await playingGame.getTimer();
        res.json({
            pl_id: plId,
            game_id: gameId,
            status: status,
            day: day,
            setting_status: settingStatus,
            timer: timer
        });
    }
});

router.post('/:id', async (req, res, next) => {
    const plId = req.params.id;
    const playingGame = new PlayingGame(plId);
    const gameId = req.body.game_id;
    const settingStatus = req.body.setting_status;
    playingGame.createPlayingGame(gameId, settingStatus).then(res.send(201)).catch(res.send(400));

})

router.put('/:id/status', async (req, res, next) => {
    const plId = req.params.id;
    const playingGame = new PlayingGame(plId);
    playingGame.updateStatus(req.body.status).then(res.send(204)).catch(res.send(400));
})

router.put('/:id/day', async (req, res, next) => {
    const plId = req.params.id;
    const playingGame = new PlayingGame(plId);
    playingGame.updateDay().then(res.send(204)).catch(res.send(400));
})

router.put('/:id/setting/status', async (req, res, next) => {
    const plId = req.params.id;
    const playingGame = new PlayingGame(plId);
    const boolean = req.body.boolean;
    if (boolean != undefined) {
        if (boolean) {
            playingGame.updateSettingStateTrue(req.body.index).then(res.send(204)).catch(res.send(400));
        }else{
            playingGame.updateSettingStateFalse(req.body.index).then(res.send(204)).catch(res.send(400));
        }
    }else{
        res.send(400);
    }
})

router.put('/:id/timer', async (req, res, next) => {
    const plId = req.params.id;
    const playingGame = new PlayingGame(plId);
    playingGame.updateDay(req.body.timer).then(res.send(204)).catch(res.send(400));
})

router.post('/:id/vote', async (req, res, next) => {
    const plId = req.params.id;
    const playingGame = new PlayingGame(plId);
    playingGame.createVote().then(res.send(201)).catch(res.send(400));
})

router.put('/:id/vote', async (req, res, next) => {
    const plId = req.params.id;
    const playingGame = new PlayingGame(plId);
    const voterIndex = req.body.voter_index;
    const votedIndex = req.body.voted_index;
    playingGame.updateVoteNumber(votedIndex)
        .then(playingGame.updateVoteState(voterIndex).then(res.send(204)).catch(res.send(400)))
        .catch(res.send(400));
})

router.get('/:id/vote',async (req, res, next) => {
    const plId = req.params.id;
    const playingGame = new PlayingGame(plId);
    const day = await playingGame.getDay();
    const numbers = await playingGame.getVoteNumbers();
    const status = await playingGame.getVoteStatus();
    const indexes = await playingGame.getVoteIndexes();
    const count = await playingGame.getVoteCount();
    res.json({
        pl_id: plId,
        day: day,
        numbers: numbers,
        status: status,
        indexes: indexes,
        count: count
    });
})

router.post('/:id/vote/revote', async (req, res, next) => {
    const plId = req.params.id;
    const playingGame = new PlayingGame(plId);
    const count = await playingGame.getVoteCount() + 1;
    const indexes = req.body.indexes;
    await playingGame.updateVotingFalse()
    playingGame.createRevote(indexes,count).then(res.send(201)).catch(res.send(400));
})

router.post('/:id/discuss',async (req, res, next) => {
    const plId = req.params.id;
    const playingGame = new PlayingGame(plId);
    playingGame.createDiscuss().then(res.send(201)).catch(res.send(400));
})

router.get('/:id/discuss',async (req, res, next) => {
    const plId = req.params.id;
    const playingGame = new PlayingGame(plId);
    const day = await playingGame.getDay();
    const remainingTime = await playingGame.getRemainingTime();
    res.json({
        pl_id: plId,
        day: day,
        remaining_time : remainingTime
    });
})

module.exports = router;

