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


// クラス名はUserだがテーブル名はusersなので注意！！！！
// Postgresの仕様でuserテーブルは作れない

module.exports = class User {


    /**
     *Creates an instance of User.
     * 
     * テーブル構造は以下の通り
     * @param {*} id : userId
     * pl_id : 参加中の参加者リストid。ゲーム終了時に削除するようにする
     * is_restarting : pl_idがあるときに他のゲームに参加しようとしたら確認をするが、その保留ステータス
     */

    constructor(id) {
        this.id = id;
    }

    /**
     * ユーザーテーブルがあるかどうか
     *
     * @returns
     */
    async isUser() {
        const query = {
            text: 'SELECT id FROM users WHERE id = $1',
            values: [this.id]
        }
        try {
            const res = await pg.query(query);
            if (res.rowCount == 1) {
                return true;
            } else if (res.rowCount > 1) {
                throw "同じユーザーデータ２つ以上あるよ"
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * ユーザーがplIdを持ってるかどうか
     *
     * @returns
     */
    async hasPlId() {
        const query = {
            text: 'select (pl_id is not null) as ans from users where id = $1',
            values: [this.id]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].ans;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 参加中の参加者リストidを返す
     *
     * @returns
     */
    async getPlid() {
        const query = {
            text: 'select pl_id from users where id = $1',
            values: [this.id]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].pl_id;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 与えられたplIdとユーザーのpl_idが一致するか否か
     *
     * @param {*} plId
     * @returns
     */
    async isMatchPlId(plId) {
        const query = {
            text: 'SELECT pl_id FROM users WHERE id = $1',
            values: [this.id]
        }
        try {
            const res = await pg.query(query);
            if (res.rows[0].pl_id == plId) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * ユーザーデータ挿入
     *
     * @param {*} plId
     */
    async createUser(plId) {
        const query = {
            text: 'INSERT INTO users (id,pl_id) VALUES ($1,$2);',
            values: [this.id, plId]
        }
        try {
            await pg.query(query);
            console.log("User Inserted");
        } catch (err) {
            console.log(err);
            console.log("新しいユーザーデータ作れんかったよ");
        }
    }

    /**
     * ユーザーの参加者リストidを更新する
     *
     * @param {*} plId
     */
    async updatePlId(plId) {
        const query = {
            text: 'UPDATE users set pl_id = $1 where id = $2',
            values: [plId, this.id]
        };
        try {
            await pg.query(query);
            console.log("Updated pl_id");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * pl_idを削除する（nullにする）
     *
     */
    async deletePlId() {
        const query = {
            text: 'UPDATE users set pl_id = null where id = $1',
            values: [this.id]
        };
        try {
            await pg.query(query);
            console.log("Updated pl_id to null");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * is_restartingをtrueに
     *
     */
    async updateIsRestartingTrue() {
        const query = {
            text: 'UPDATE users set is_restarting = true where id = $1',
            values: [this.id]
        };
        try {
            await pg.query(query);
            console.log("Updated is_restarting true");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * is_restartingをfalseに
     *
     */
    async updateIsRestartingFalse() {
        const query = {
            text: 'UPDATE users set is_restarting = false where id = $1',
            values: [this.id]
        };
        try {
            await pg.query(query);
            console.log("Updated is_restarting true");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * ゲームを初めからやろうとしてるかどうか
     *
     * @returns
     */
    async isRestarting() {
        const query = {
            text: 'SELECT is_restarting FROM users WHERE id = $1',
            values: [this.id]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].is_restarting;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 表示名を返す
     *
     * @returns
     */
    async getDisplayName() {
        const profile = await client.getProfile(this.id);
        const displayName = profile.displayName;
        return displayName;
    }

}