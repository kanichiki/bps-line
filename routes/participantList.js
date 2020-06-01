const express = require('express');
const router = express.Router();

const ParticipantList = require("../classes/ParticipantList");

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
     * next()を呼ぶことで、下のapp.get()の部分が処理される.
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

router.get('/:id', async (req, res, next) => {
    const plId = req.params.id;
    const pl = new ParticipantList();
    const plExists = await pl.exists(plId);
    if (!plExists) {
        res.send(404);
    } else {
        const groupId = await pl.getGroupId(plId);
        const userIds = await pl.getUserIds(plId);
        const displayNames = await pl.getDisplayNames(plId);
        res.json({
            id: plId,
            group_id: groupId,
            user_ids: userIds,
            display_names: displayNames
        })
    }
});

module.exports = router;