const line = require("@line/bot-sdk");
const { Client } = require('pg')
const pg = new Client(process.env.DATABASE_URL)

pg.connect().catch((error) => {
    console.log('Error connecting to database', error)
})

const config = {
    channelAccessToken: process.env.channelAccessToken,
    channelSecret: process.env.channelSecret
};

const client = new line.Client(config);

module.exports = class ParticipantList {
    constructor(event) {
        this.event = event;
    }

    /**
     * 参加者リストにグループを追加する
     * デフォルトで発言者をuseridsに追加
     *
     * @param {*} event
     * @returns
     */

    async createPaticipantList() {
        const userIds = [this.event.source.userId];
        const query = {
            text: 'INSERT INTO participant_list (group_id,user_ids) VALUES ($1,$2);',
            values: [this.event.source.groupId, userIds]
        }
        try {
            this.disablePreviousParticipantList(); // 以前の同じグループのデータを削除
            await pg.query(query);
            console.log("Paticipant List Inserted");
            return true;
        } catch (err) {
            console.log(err);
            console.log("新しい参加者リスト作れんかったよ");
            return false;
        }
    }


    /**
    * 発言グループの参加者リストを返す
    *
    * @param {*} event
    * @returns
    */

    async readParticipantList() {
        const query = {
            text: 'SELECT user_ids FROM participant_list WHERE group_id = $1 AND is_working = true;',
            values: [this.event.source.groupId]
        }
        try {
            const res = await pg.query(query);
            console.log(res.rows[0].user_ids);
            return res.rows[0].user_ids;
        } catch (err) {
            console.log(err);
        }
    }


    /**
     * 発言者を発言グループの参加者リストに追加
     *
     * @param {*} event
     * @returns
     */

    async addPaticipantList() {
        const query = {
            text: 'UPDATE participant_list SET user_ids = array_append(user_ids, $1) WHERE group_id = $2 AND is_working = true;',
            values: [this.event.source.userId, this.event.source.groupId]
        }
        try {
            await pg.query(query);
            console.log("Added Participant");
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }


    /**
     * グループの参加者リスト情報を無効化する
     * is_workingをfalseにする
     *
     * @param {*} event
     */

    async disablePreviousParticipantList() {
        const query = {
            text: 'UPDATE participant_list set is_working = false where group_id = $1',
            values: [this.event.source.groupId]
        }
        try {
            await pg.query(query);
            console.log("Previous Participant List Deleted");
        } catch (err) {
            console.log(err);
            console.log("ははは");
        }
    }


    /**
     * 発言者が参加者リストに含まれるかどうか
     *
     * @param 
     * @param
     * @returns boolean
     */

    async userExistsInParticipantList() {
        const userIds = await this.readParticipantList();
        let res = false;
        for (const userId of userIds) {
            if (userId == this.event.source.userId) {
                res = true;
            }
        }
        return res;
    }

    /**
    * 発言グループの参加者リストが存在するかどうか
    *
    * @param
    * @returns
    */
    async participantListExists() {
        const query = {
            text: 'SELECT id FROM participant_list WHERE group_id = $1 AND is_working = true;',
            values: [this.event.source.groupId]
        }
        try {
            const res = await pg.query(query);
            if (res.rowCount != 0) {
                console.log("true");
                return true;
            } else {
                console.log("false");
                return false;
            }
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    /**
     * 参加者の表示名の配列を返す
     *
     * @param
     * @returns
     */

    async readProfiles() {
        const profiles = [];
        const userIds = await this.readParticipantList();
        try {
            for (const userId of userIds) {
                const profile = await client.getProfile(userId).then(profile =>
                    profiles.push(profile.displayName)
                );
            }
            return profiles;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 発言グループの募集中の参加者リストのIdを返す
     * disableより前に実行するよう注意
     *
     * @returns
     */
    async readParticipantListId() {
        const query = {
            text: 'SELECT id FROM participant_list WHERE group_id = $1 AND is_working = true;',
            values: [this.event.source.groupId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].id;
        } catch (err) {
            console.log(err);
        }
    }


}