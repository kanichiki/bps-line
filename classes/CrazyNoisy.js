const { Client } = require('pg')
const pg = new Client(process.env.DATABASE_URL)

pg.connect().catch((error) => {
    console.log('Error connecting to database', error)
})

require('date-utils');

const ParticipantList = require("./ParticipantList");
const commonFunction = require("../template/functions/commonFunction");

class CrazyNoisy extends ParticipantList {

    /**
     *Creates an instance of CrazyNoisy.
     * @param {*} plId
     */

    constructor(plId) {
        super();
        this.plId = plId;
        this.setting = "crazy_noisy_setting";
        this.status = "crazy_noisy_status";
        this.vote = "crazy_noisy_vote";
        this.revote = "crazy_noisy_revote";
        this.guru = "教祖";
        this.fanatic = "狂信者";
        this.detective = "探偵";
        this.sp = "用心棒"
        this.citizen = "市民";
    }

    /**
     * ParticipantListのメソッド拡張
     * 参加者の人数を返す
     *
     * @returns
     */
    async getUserNumber() {
        return super.getUserNumber(this.plId);
    }

    /**
     * ParticipantListのメソッド拡張
     *
     * @param {*} userIndex
     * @returns
     * @memberof CrazyNoisy
     */
    async getDisplayName(userIndex) {
        return super.getDisplayName(userIndex, this.plId);
    }

    async getDisplayNames() {
        return super.getDisplayNames(this.plId)
    }

    async getUserIndexFromUserId(userId) {
        return super.getUserIndexFromUserId(this.plId, userId);
    }

    async isUserParticipant(userId) {
        return super.isUserParticipant(this.plId, userId);
    }

    async getUserIds() {
        return super.getUserIds(this.plId);
    }

    async getUserId(userIndex) {
        return super.getUserId(this.plId, userIndex);
    }

    /**
     * settingデータを挿入
     *
     * @memberof CrazyNoisy
     */
    async createSetting() {
        const query = {
            text: `INSERT INTO ${this.setting} (pl_id) VALUES ($1);`,
            values: [this.plId]
        }
        try {
            await pg.query(query);
            console.log("Crazy-Noisy Setting Inserted");
        } catch (err) {
            console.log(err);
            console.log("新しいクレイジーノイジーの設定作れんかったよ");
        }
    }

    /**
     * settingデータを持っているかどうか
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async hasSetting() {
        const query = {
            text: `SELECT pl_id from ${this.setting} where pl_id = $1`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            if (res.rowCount == 1) {
                return true;
            } else if (res.rowCount > 1) {
                throw "同じpl_idの設定データが二個以上あるよ"
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
        }
    }


    /**
     * 狂信者の数
     * 4~6人なら0or1、7~9人なら1or2...
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async chooseFanaticNumber() {
        const userNumber = await this.getUserNumber();
        const number = Math.floor((userNumber - 1) / 3);
        const fanaticNumber = await commonFunction.getRandomNumber(number - 1, number);
        return fanaticNumber;
    }

    /**
     * 探偵の数
     * 7人以上なら1人
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async chooseDetectiveNumber() {
        const userNumber = await this.getUserNumber();
        const number = Math.floor((userNumber - 1) / 3);
        const detectiveNumber = await commonFunction.getRandomNumber(number - 1, number);
        if (detectiveNumber > 1) {
            detectiveNumber = 1;
        }
        return detectiveNumber;
    }

    /**
     * 用心棒の人数
     * 7人以上で1人
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async chooseSpNumber() {
        const userNumber = await this.getUserNumber();
        let spNumber = 0;
        if (userNumber > 6) {
            spNumber = 1
        }
        return spNumber
    }

    /**
     * 役職を設定
     *
     * @memberof CrazyNoisy
     */
    async updatePositions() {
        const userNumber = await this.getUserNumber();
        const guruNumber = 1;
        const fanaticNumber = await this.chooseFanaticNumber();
        // const fanaticNumber = 1;
        const detectiveNumber = await this.chooseDetectiveNumber();
        // const detectiveNumber = 1;
        let positions = [];
        let isDecided = [];

        for (let i = 0; i < userNumber; i++) {
            isDecided[i] = false;
        }

        let undecided = [];
        for (let i = 0; i < userNumber; i++) {
            if (!isDecided[i]) { // まだ決まってなかったら
                undecided.push(i);
            }
        }

        const guruIndexes = await commonFunction.getRandomIndexes(undecided, guruNumber);
        for (let guruIndex of guruIndexes) {
            positions[guruIndex] = this.guru;
            isDecided[guruIndex] = true;
        }

        undecided = [];
        for (let i = 0; i < userNumber; i++) {
            if (!isDecided[i]) { // まだ決まってなかったら
                undecided.push(i);
            }
        }

        const fanaticIndexes = await commonFunction.getRandomIndexes(undecided, fanaticNumber);
        for (let fanaticIndex of fanaticIndexes) {
            positions[fanaticIndex] = this.fanatic;
            isDecided[fanaticIndex] = true;
        }

        undecided = [];
        for (let i = 0; i < userNumber; i++) {
            if (!isDecided[i]) { // まだ決まってなかったら
                undecided.push(i);
            }
        }

        const detectiveIndexes = await commonFunction.getRandomIndexes(undecided, detectiveNumber);
        for (let detectiveIndex of detectiveIndexes) {
            positions[detectiveIndex] = this.detective;
            isDecided[detectiveIndex] = true;
        }

        for (let i = 0; i < userNumber; i++) {
            if (!isDecided[i]) { // まだ決まってなかったら
                positions[i] = this.citizen;
            }
        }

        const query = {
            text: `UPDATE ${this.setting} set positions = $1 where pl_id = $2`,
            values: [positions, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated positions");
        } catch (err) {
            console.log(err);
        }

    }

    /**
     * 役職を配列で返す
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async getPositions() {
        const query = {
            text: `SELECT positions FROM ${this.setting} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].positions;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 役職を返す
     *
     * @param {*} userIndex
     * @returns
     * @memberof CrazyNoisy
     */
    async getPosition(userIndex) {
        const positions = await this.getPositions();
        return positions[userIndex];
    }

    /**
     * 教祖かどうかを返す
     *
     * @param {*} userIndex
     * @returns
     * @memberof CrazyNoisy
     */
    async isGuru(userIndex) {
        const positions = await this.getPositions();
        let res = false;
        if (positions[userIndex] == this.guru) {
            res = true;
        }
        return res;
    }


    // ここからステータスに関するもの

    /**
     * ステータスデータ挿入
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async createStatus() {
        let actions = [];
        const userNumber = this.getUserNumber();
        for (let i = 0; i < userNumber; i++) {
            actions[i] = false;
        }
        const query = {
            text: `INSERT INTO ${this.status} (pl_id,actions) VALUES ($1,$2);`,
            values: [this.plId, actions]
        }
        try {
            await pg.query(query);
            console.log("Crazy Noisy Setting Status Inserted");
            return true;
        } catch (err) {
            console.log(err);
            console.log("新しいクレイジーノイジーの設定の進捗データ作れんかったよ");
            return false;
        }
    }

    /**
     * ステータスデータを持っているかどうかを返す
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async hasStatus() {
        const query = {
            text: `SELECT pl_id from ${this.status} where pl_id = $1`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            if (res.rowCount == 1) {
                return true;
            } else if (res.rowCount > 1) {
                throw "同じpl_idのステータスデータが二個以上あるよ"
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * モード選択ステータスをtrueに
     *
     * @memberof CrazyNoisy
     */
    async updateModeStatusTrue() {
        const query = {
            text: `UPDATE ${this.status} set mode = true where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated mode status");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * モード選択ステータスをfalseに
     *
     * @memberof CrazyNoisy
     */
    async updateModeStatusFalse() {
        const query = {
            text: `UPDATE ${this.status} set mode = false where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated mode status false");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * モードステータスを取得
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async getModeStatus() {
        const query = {
            text: `SELECT mode FROM ${this.status} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].mode;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * タイプ選択ステータスをtrueに
     *
     * @memberof CrazyNoisy
     */
    async updateTypeStatusTrue() {
        const query = {
            text: `UPDATE ${this.status} set type = true where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated type status");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * タイプ選択ステータスをfalseに
     *
     * @memberof CrazyNoisy
     */
    async updateTypeStatusFalse() {
        const query = {
            text: `UPDATE ${this.status} set type = false where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated type status false");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 確認がNoだった場合に設定ステータスをリセット
     *
     * @memberof CrazyNoisy
     */
    async resetSettingStatus() {
        await this.updateModeStatusFalse();
        await this.updateTypeStatusFalse();
    }

    /**
     * タイプステータスを取得
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async getTypeStatus() {
        const query = {
            text: `SELECT type FROM ${this.status} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].type;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 確認状況をtrueにする
     *
     */
    async updateConfirmStatusTrue() {
        const query = {
            text: `UPDATE ${this.status} set confirm = true where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated confirm status");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 設定を確認済みかどうかを返す
     *
     * @returns
     */
    async getSettingConfirmStatus() {
        const query = {
            text: `SELECT confirm FROM ${this.status} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].confirm;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 議論中ステータスをtrueに
     *
     * @memberof CrazyNoisy
     */
    async updateDiscussStatusTrue() {
        const query = {
            text: `UPDATE ${this.status} set discuss = true where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated discuss status");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 議論中ステータスをfalseに
     *
     * @memberof CrazyNoisy
     */
    async updateDiscussStatusFalse() {
        const query = {
            text: `UPDATE ${this.status} set discuss = false where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated discuss status false");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 議論中ステータスを取得
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async getDiscussStatus() {
        const query = {
            text: `SELECT discuss FROM ${this.status} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].discuss;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 通知ステータスをtrueにする
     *
     */
    async updateNotifyStatusTrue() {
        const query = {
            text: `UPDATE ${this.status} set notify = true where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated notify status");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 通知ステータスをfalseに
     *
     * @memberof CrazyNoisy
     */
    async updateNotifyStatusFalse() {
        const query = {
            text: `UPDATE ${this.status} set notify = false where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated notify status false");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 残り1分を通知済みかどうかを返す
     *
     * @returns
     */
    async getNotifyStatus() {
        const query = {
            text: `SELECT notify FROM ${this.status} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].notify;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 投票ステータスをtrueにする
     *
     */
    async updateVoteStatusTrue() {
        const query = {
            text: `UPDATE ${this.status} set vote = true where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated vote status");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 投票ステータスをfalseに
     *
     * @memberof CrazyNoisy
     */
    async updateVoteStatusFalse() {
        const query = {
            text: `UPDATE ${this.status} set vote = false where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated vote status false");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 投票中かどうかを返す
     *
     * @returns
     */
    async getVoteStatus() {
        const query = {
            text: `SELECT vote FROM ${this.status} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].vote;
        } catch (err) {
            console.log(err);
        }
    }


    /**
     * 再投票ステータスをtrueにする
     *
     */
    async updateRevoteStatusTrue() {
        const query = {
            text: `UPDATE ${this.status} set revote = true where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated revote status");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 再投票ステータスをfalseに
     *
     * @memberof CrazyNoisy
     */
    async updateRevoteStatusFalse() {
        const query = {
            text: `UPDATE ${this.status} set revote = false where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated revote status false");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 再投票中かどうかを返す
     *
     * @returns
     */
    async getRevoteStatus() {
        const query = {
            text: `SELECT revote FROM ${this.status} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].revote;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * アクション中ステータスをtrueにする
     *
     */
    async updateActionStatusTrue() {
        const query = {
            text: `UPDATE ${this.status} set action = true where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated action status");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * アクション中ステータスをfalseに
     *
     * @memberof CrazyNoisy
     */
    async updateActionStatusFalse() {
        const query = {
            text: `UPDATE ${this.status} set action = false where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated action status false");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * アクション中かどうかを返す
     *
     * @returns
     */
    async getActionStatus() {
        const query = {
            text: `SELECT action FROM ${this.status} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].action;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Action実行ステータスをすべてfalseにする
     *
     * @memberof CrazyNoisy
     */
    async updateActionsStatusFalse() {
        const userNumber = await this.getUserNumber();
        let actions = [];
        for (let i = 0; i < userNumber; i++) {
            actions[i] = false;
        }
        const query = {
            text: `UPDATE ${this.status} set actions = $1 where pl_id = $2`,
            values: [actions, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated actions false");
        } catch (err) {
            console.log(err);
        }
    }


    /**
     * actionsステータスを初期化
     * 探偵と教祖のみfalseに
     *
     * @memberof CrazyNoisy
     */
    async initializeActionsStatus() {
        const userNumber = await this.getUserNumber();
        const positions = await this.getPositions();
        let actions = [];
        for (let i = 0; i < userNumber; i++) {
            if (positions[i] == this.guru || positions[i] == this.detective) {
                actions[i] = false;
            } else {
                actions[i] = true;
            }
        }
        const query = {
            text: `UPDATE ${this.status} set actions = $1 where pl_id = $2`,
            values: [actions, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated actions false");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * actionsステータスのuserIndex番目をtrueにする
     *
     * @param {*} userIndex
     * @memberof CrazyNoisy
     */
    async updateActionsStateTrue(userIndex) {
        const actions = await this.getActionsStatus();
        actions[userIndex] = true;
        const query = {
            text: `UPDATE ${this.status} set actions = $1 where pl_id = $2`,
            values: [actions, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated action true");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * userIndexのユーザーのアクションステータスを返す
     *
     * @param {*} userIndex
     * @returns
     * @memberof CrazyNoisy
     */
    async getActionsState(userIndex) {
        const query = {
            text: `SELECT actions from ${this.status} WHERE pl_id = $1`,
            values: [this.plId]
        };
        try {
            const res = await pg.query(query);
            return res.rows[0].actions[userIndex];
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * アクションステータスの配列を返す
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async getActionsStatus() {
        const query = {
            text: `SELECT actions from ${this.status} WHERE pl_id = $1`,
            values: [this.plId]
        };
        try {
            const res = await pg.query(query);
            return res.rows[0].actions;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * アクションが完了しているかどうか
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async isActionsCompleted() {
        const status = await this.getActionsStatus();
        let res = true;
        for (let state of status) {
            if (!state) {
                res = false
            }
        }
        return res;
    }




    /**
     * 最初の役職確認ステータスを設定
     *
     * @memberof CrazyNoisy
     */
    async updateConfirmsStatus() {
        const userNumber = await this.getUserNumber();
        const confirms = [];
        for (let i = 0; i < userNumber; i++) {
            confirms[i] = false;
        }
        const query = {
            text: `UPDATE ${this.status} set confirms = $1 where pl_id = $2`,
            values: [confirms, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated confirms status first");
        } catch (err) {
            console.log(err);
        }
    }


    /**
     * Confirmsステータスを取得
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async getConfirmsStatus() {
        const query = {
            text: `SELECT confirms FROM ${this.status} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].confirms;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 役職確認が完了しているかどうか
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async isConfirmsCompleted() {
        const status = await this.getConfirmsStatus();
        let res = true;
        for (let state of status) {
            if (!state) {
                res = false
            }
        }
        return res;
    }

    /**
     * userIndexの役職確認ステータスをtrueに
     *
     * @param {*} userIndex
     * @memberof CrazyNoisy
     */
    async updateConfirmsStateTrue(userIndex) {
        let confirms = await this.getConfirmsStatus();
        confirms[userIndex] = true;
        const query = {
            text: `UPDATE ${this.status} set confirms = $1 where pl_id = $2`,
            values: [confirms, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated confirms state");
        } catch (err) {
            console.log(err);
        }
    }


    /**
     * 勝者発表ステータスをtrueにする
     *
     */
    async updateWinnerStatusTrue() {
        const query = {
            text: `UPDATE ${this.status} set winner = true where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated winner status");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 勝者発表済みかどうかを返す
     *
     * @returns
     */
    async getWinnerStatus() {
        const query = {
            text: `SELECT winner FROM ${this.status} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].winner;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * もろもろ発表ステータスをtrueにする
     *
     */
    async updateResultStatusTrue() {
        const query = {
            text: `UPDATE ${this.status} set result = true where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated result status");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * もろもろ発表済みかどうかを返す
     *
     * @returns
     */
    async getResultStatus() {
        const query = {
            text: `SELECT result FROM ${this.status} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].result;
        } catch (err) {
            console.log(err);
        }
    }


    // ここまでステータス関連

    /**
     * モードを設定
     *
     * @param {*} mode
     * @memberof CrazyNoisy
     */
    async updateMode(mode) {
        const query = {
            text: `UPDATE ${this.setting} set mode = $1 where pl_id = $2`,
            values: [mode, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated mode");
        } catch (err) {
            console.log(err);
            console.log("モード設定できんかった");
        }
    }

    /**
     * モードを取得
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async getMode() {
        const query = {
            text: `SELECT mode FROM ${this.setting} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].mode;
        } catch (err) {
            console.log(err);
        }
    }


    /**
     * 話し合いタイプを設定
     *
     * @param {*} type
     * @memberof CrazyNoisy
     */
    async updateType(type) {
        const query = {
            text: `UPDATE ${this.setting} set type = $1 where pl_id = $2`,
            values: [type, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated type");
        } catch (err) {
            console.log(err);
            console.log("話し合いタイプ設定できんかった");
        }
    }

    /**
     * 話し合いタイプを取得
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async getType() {
        const query = {
            text: `SELECT type FROM ${this.setting} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].type;
        } catch (err) {
            console.log(err);
        }
    }


    /**
     * 話し合いスタート時間を取得
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async getStartTime() {
        const query = {
            text: `SELECT start_time FROM ${this.setting} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].start_time;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * start_timeを現在の標準時刻で設定
     *
     * @memberof CrazyNoisy
     */
    async updateStartTime() {
        const startTime = await commonFunction.getCurrentTime();
        // const startTime = new Date().toUTCString;
        const query = {
            text: `UPDATE ${this.setting} set start_time = $1 where pl_id = $2`,
            values: [startTime, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated start-time");
        } catch (err) {
            console.log(err);
        }
    }


    /**
     * timerの値を取得(単位は分)
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async getTimer() {
        const query = {
            text: `SELECT timer FROM ${this.setting} WHERE pl_id = $1`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].timer;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * タイマーの値を設定
     *
     * @param {*} minutes
     * @memberof CrazyNoisy
     */
    async updateTimer(minutes) {
        const query = {
            text: `UPDATE ${this.setting} set timer = $1 where pl_id = $2`,
            values: [minutes, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated timer");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * endTimeを計算して入れる
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async updateEndTime() {
        const timer = await this.getTimer();
        const minutes = timer + " minutes";
        const query = {
            text: `update ${this.setting} set end_time = start_time + $1 WHERE pl_id = $2`,
            values: [minutes, this.plId]
        }
        try {
            await pg.query(query);
            console.log("Updated end-time ");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 時間の設定を一括挿入
     *
     * @memberof CrazyNoisy
     */
    async updateTimeSetting() {
        await this.updateStartTime();
        await this.updateEndTime();
    }

    /**
     * 残り時間が1分を切っているかどうかを返す
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async isRemainingTimeLessThan1minute() {
        const currentTime = await commonFunction.getCurrentTime();
        const minutes = "1 minutes"
        const query = {
            text: `SELECT ((end_time - $1 ) < $2 ) as ans FROM ${this.setting} WHERE pl_id = $3`,
            values: [currentTime, minutes, this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].ans;
        } catch (err) {
            console.log(err);
            console.log("ここでエラー")
        }
    }

    /**
     * 話し合い時間が終了しているかどうかを返す
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async isOverTime() {
        const currentTime = await commonFunction.getCurrentTime();
        const second = "0 second"
        const query = {
            text: `SELECT ((end_time - $1 ) < $2 ) as ans FROM ${this.setting} WHERE pl_id = $3`,
            values: [currentTime, second, this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].ans;
        } catch (err) {
            console.log(err);
            console.log("いや、ここでエラー");
            console.log(currentTime);
        }
    }

    /**
     * 〇分××秒の形で残り時間を返す
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async getRemainingTime() {
        const currentTime = await commonFunction.getCurrentTime();

        const query1 = {
            text: `SELECT EXTRACT(minutes from (end_time - $1 )) AS minutes FROM ${this.setting} WHERE pl_id = $2`,
            values: [currentTime, this.plId]
        }
        const query2 = {
            text: `SELECT EXTRACT(second from (end_time - $1 )) AS second FROM ${this.setting} WHERE pl_id = $2`,
            values: [currentTime, this.plId]
        }

        try {
            const res1 = await pg.query(query1);
            const minutes = res1.rows[0].minutes;
            const res2 = await pg.query(query2);
            const second = res2.rows[0].second;

            const remainingTime = minutes + "分" + second + "秒";
            return remainingTime;
        } catch (err) {
            console.log(err);
        }
    }


    /**
     * brainwashの初期データを設定
     * 教祖と狂信者は洗脳済み
     *
     * @memberof CrazyNoisy
     */
    async updateBrainwashStatus() {
        const positions = await this.getPositions();
        const userNumber = await this.getUserNumber();
        let brainwash = [];
        for (let i = 0; i < userNumber; i++) {
            if (positions[i] == this.guru || positions[i] == this.fanatic) {
                brainwash[i] = true;
            } else {
                brainwash[i] = false;
            }
        }
        const query = {
            text: `UPDATE ${this.setting} set brainwash = $1 where pl_id = $2`,
            values: [brainwash, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated brainwash first");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 洗脳ステータスを返す
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async getBrainwashStatus() {
        const query = {
            text: `SELECT brainwash FROM ${this.setting} where pl_id = $1`,
            values: [this.plId]
        };
        try {
            const res = await pg.query(query);
            return res.rows[0].brainwash;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 洗脳されているかどうか
     *
     * @param {*} userIndex
     * @returns
     * @memberof CrazyNoisy
     */
    async isBrainwash(userIndex) {
        const status = await this.getBrainwashStatus();
        return status[userIndex];
    }

    /**
     * 洗脳されていない人数
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async notBrainwashNumber(){
        const status = await this.getBrainwashStatus();
        let res = 0;
        for(let state of status){
            if(!state){
                res++;
            }
        }
        return res;
    }

    /**
     * 洗脳が完了しているかどうか
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async isBrainwashCompleted() {
        /*
        const status = await this.getBrainwashStatus();
        let res = true;
        for (let state of status) {
            if (!state) {
                res = false;
            }
        }
        return res;
        */

        const notBrainwashNumber = await this.notBrainwashNumber();
        let res = false;
        if(notBrainwashNumber <= 1){ // 教祖の人数と同じかそれより少なかったら
            res = true;
        }   
        return res;
    }

    /**
     * ユーザーの洗脳ステータスをアップデート
     *
     * @param {*} userIndex
     * @memberof CrazyNoisy
     */
    async updateBrainwashState(userIndex) {
        const brainwash = await this.getBrainwashStatus();
        brainwash[userIndex] = true;
        const query = {
            text: `UPDATE ${this.setting} set brainwash = $1 where pl_id = $2`,
            values: [brainwash, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated brainwash");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 狂気のidをランダムで
     * 1:チャット
     * 2:通話
     * 3:ビデオ通話
     *
     * @param {*} type
     * @returns
     * @memberof CrazyNoisy
     */
    async chooseCrazinessId(type) {
        let query = {};
        if (type == 1) {
            query = {
                text: `SELECT id FROM craziness WHERE type = 1 ORDER BY random() LIMIT 1`
            }
        }
        if (type == 2) {
            query = {
                text: `SELECT id FROM craziness WHERE type IN (1,2) ORDER BY random() LIMIT 1`
            }
        }
        if (type == 3) {
            query = {
                text: `SELECT id FROM craziness WHERE type IN (1,2,3) ORDER BY random() LIMIT 1`
            }
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].id;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 最初の狂気を割り振る
     * 狂信者のみ
     *
     * @memberof CrazyNoisy
     */
    async updateDefaultCrazinessIds() {
        const positions = await this.getPositions();
        const type = await this.getType();
        const userNumber = await this.getUserNumber();
        let crazinessIds = [];
        for (let i = 0; i < userNumber; i++) {
            let crazinessId = new Array(7); // postgresは長方形配列しか入れられない
            if (positions[i] == this.fanatic) {
                const craziness = await this.chooseCrazinessId(type);
                crazinessId[0] = craziness;
            }
            crazinessIds[i] = crazinessId;
        }
        const query = {
            text: `UPDATE ${this.setting} set craziness_ids = $1 where pl_id = $2`,
            values: [crazinessIds, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated default crazinessIds");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * デモモード（全員に狂気配布）
     *
     * @memberof CrazyNoisy
     */
    async updateDefaultCrazinessIdsInDemo() {
        const type = await this.getType();
        const userNumber = await this.getUserNumber();
        let crazinessIds = [];
        for (let i = 0; i < userNumber; i++) {
            let crazinessId = new Array(7); // postgresは長方形配列しか入れられない
            const craziness = await this.chooseCrazinessId(type);
            crazinessId[0] = craziness;
            crazinessIds[i] = crazinessId;
        }
        const query = {
            text: `UPDATE ${this.setting} set craziness_ids = $1 where pl_id = $2`,
            values: [crazinessIds, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated default crazinessIds in demo");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 狂気のidを取得する
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async getCrazinessIds() {
        const query = {
            text: `SELECT craziness_ids FROM ${this.setting} WHERE pl_id = $1`,
            values: [this.plId]
        };
        try {
            const res = await pg.query(query);
            return res.rows[0].craziness_ids;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 狂気の内容を取得
     *
     * @param {*} crazinessId
     * @returns
     * @memberof CrazyNoisy
     */
    async getCrazinessContent(crazinessId) {
        const query = {
            text: `SELECT content FROM craziness WHERE id = $1`,
            values: [crazinessId]
        };
        try {
            const res = await pg.query(query);
            return res.rows[0].content;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 狂気の補足を取得
     *
     * @param {*} crazinessId
     * @returns
     * @memberof CrazyNoisy
     */
    async getCrazinessRemark(crazinessId) {
        const query = {
            text: `SELECT remark FROM craziness WHERE id = $1`,
            values: [crazinessId]
        };
        try {
            const res = await pg.query(query);
            return res.rows[0].remark;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 狂気追加
     *
     * @param {*} userIndex
     * @memberof CrazyNoisy
     */
    async addCrazinessId(userIndex) {
        const crazinessIds = await this.getCrazinessIds();
        let status = false;
        const type = await this.getType()
        for (let i = 0; i < crazinessIds[userIndex].length; i++) {
            if (crazinessIds[userIndex][i] == null) {
                LOOP: while (!status) {
                    const crazinessId = await this.chooseCrazinessId(type);
                    for (let j = 0; j < i; j++) {
                        if (crazinessIds[userIndex][j] == crazinessId) {
                            break LOOP;
                        }
                    }
                    crazinessIds[userIndex][i] = crazinessId;
                    status = true;
                }
                break;
            }
        }

        const query = {
            text: `UPDATE ${this.setting} set craziness_ids = $1 where pl_id = $2`,
            values: [crazinessIds, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Added crazinessIds");
        } catch (err) {
            console.log(err);
        }

    }

    /**
     * 日付を1足す
     *
     * @memberof CrazyNoisy
     */
    async updateDay() {
        const query = {
            text: `UPDATE ${this.status} set day = day + 1 where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated day");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 何日目かを返す
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async getDay() {
        const query = {
            text: `SELECT day from ${this.status} where pl_id = $1`,
            values: [this.plId]
        };
        try {
            const res = await pg.query(query);
            return res.rows[0].day;
        } catch (err) {
            console.log(err);
        }
    }


    // 以下投票に関する関数

    /**
     * 投票データを挿入する
     * numbersは誰が何票入ってるかの配列
     * statusは誰が投票済みかの配列
     *
     * @returns
     */
    async createVote() {
        const userNumber = await this.getUserNumber();
        let votes = [];
        let status = [];
        for (let i = 0; i < userNumber; i++) {
            votes.push(0);
            status.push(false);
        }

        const query = {
            text: `INSERT INTO ${this.vote} (pl_id,numbers,status) VALUES ($1,$2,$3);`,
            values: [this.plId, votes, status]
        }
        try {
            await pg.query(query);
            console.log("Crazy-Noisy Vote Inserted");
            return true;
        } catch (err) {
            console.log(err);
            console.log("新しいクレイジーノイジーの投票データ作れんかったよ");
            return false;
        }
    }

    /**
     * 投票データを持っているか
     *
     * @returns
     * @memberof CrazyNoisy
     */
    async hasVote() {
        const query = {
            text: `SELECT pl_id from ${this.vote} where pl_id = $1`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            if (res.rowCount == 1) {
                return true;
            } else if (res.rowCount > 1) {
                throw "同じpl_idの設定データが二個以上あるよ"
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
        }
    }




    /**
     * 得票数の配列を返す
     *
     * @returns
     */
    async getVoteNumbers() {
        const query = {
            text: `SELECT numbers FROM ${this.vote} WHERE pl_id = $1`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].numbers;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 投票状況の配列を返す
     *
     * @returns
     */
    async getUsersVoteStatus() {
        const query = {
            text: `SELECT status FROM ${this.vote} WHERE pl_id = $1`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].status;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 与えられたuserIndexのユーザーの投票状況を返す
     *
     * @param {*} userIndex
     * @returns
     */
    async isVotedUser(userIndex) {
        const status = await this.getUsersVoteStatus();
        return status[userIndex];
    }

    /**
     * 投票が全員完了しているか否かを返す
     *
     * @returns
     */
    async isVoteCompleted() {
        const status = await this.getUsersVoteStatus();
        let res = true;
        for (let state of status) {
            if (!state) {
                res = false
            }
        }
        return res;
    }

    /**
     * 与えられたuserIndexのユーザーの得票数を1増やす
     *
     * @param {*} userIndex
     */
    async updateVoteNumber(userIndex) {
        let numbers = await this.getVoteNumbers();
        numbers[userIndex] += 1; // 得票数1追加
        const query = {
            text: `UPDATE ${this.vote} set numbers = $1 where pl_id = $2`,
            values: [numbers, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated vote number");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 与えられたuserIndexのユーザーの投票状況をtrueにする
     *
     * @param {*} userIndex
     */
    async updateUserVoteStatus(userIndex) {
        let status = await this.getUsersVoteStatus();
        if (!status[userIndex]) {
            status[userIndex] = true;
        } else {
            throw "既に投票済み";
        }
        const query = {
            text: `UPDATE ${this.vote} set status = $1 where pl_id = $2`,
            values: [status, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated vote status");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 最多得票者が複数いるかどうかを返す
     *
     * @returns
     */
    async multipleMostVotedUserExists() {
        const voteNumbers = await this.getVoteNumbers();
        let res = false;
        let max = -1;
        for (let voteNumber of voteNumbers) {
            if (voteNumber > max) {
                max = voteNumber;
                res = false;
            } else if (voteNumber == max) {
                res = true;
            }
        }
        return res;
    }

    /**
     * 最多得票数を返す
     *
     * @returns
     */
    async getMostVotedNumber() {
        const voteNumbers = await this.getVoteNumbers();
        const number = Math.max.apply(null, voteNumbers);
        return number;
    }

    /**
     * 最も得票数の多いユーザーのインデックスの配列を返す
     * ※注意：最多得票者が1人のときは使わない！！
     *
     * @returns
     */
    async getMostVotedUserIndexes() {
        const voteNumbers = await this.getVoteNumbers();
        const mostVotedNumber = await this.getMostVotedNumber();
        let indexes = [];
        for (let i = 0; i < voteNumbers.length; i++) {
            if (voteNumbers[i] == mostVotedNumber) {
                indexes.push(i);
            }
        }
        return indexes;
    }

    /**
     * 再投票の候補者の配列を取得する
     * 上の関数の結果と同じになるはず
     * 冗長かな...？そのうち消すかも
     *
     * @returns
     */
    async getRevoteCandidateIndexes() {
        const query = {
            text: `SELECT indexes FROM ${this.revote} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].indexes;
        } catch (err) {
            console.log(err);
            console.log("再投票の候補者取得できんかった");
        }
    }

    /**
     * ParticipantListの拡張メソッド
     * 参加者のインデックスの配列を返す
     *
     * @returns
     */
    async getUserIndexes() {
        return super.getUserIndexes(this.plId);
    }

    /**
     * 与えられたテキストがユーザーインデックスかどうかを返す
     * 不正なpostback対策
     *
     * @param {*} text
     * @returns
     */
    async isUserIndex(text) {
        const userIndexes = await this.getUserIndexes();
        let res = false;
        for (let userIndex of userIndexes) {
            if (userIndex == text) {
                res = true;
            }
        }
        return res;
    }

    /**
     * 与えられたテキストが再投票の候補者かどうかを返す
     * 基本的に表示するのは候補者の名前だけだが前のゲームの投票Flex Messageなどでpostbackを送ってくることも想定されるため
     *
     * @param {*} text
     * @returns
     */
    async isRevoteCandidateIndex(text) {
        const candidateIndexes = await this.getRevoteCandidateIndexes();
        let res = false;
        for (let candidateIndex of candidateIndexes) {
            if (text == candidateIndex) {
                res = true;
            }
        }
        return res;
    }

    /**
     * 与えられたindexesで再投票データを作る
     * indexesには再投票の候補者のインデックスの配列が入る
     *
     * @returns
     */
    async createRevote(candidateIndexes) {
        const query = {
            text: `INSERT INTO ${this.revote} (pl_id,indexes) VALUES ($1,$2);`,
            values: [this.plId, candidateIndexes]
        }
        try {
            await pg.query(query);
            console.log("Word-Wolf Revote Inserted");
            return true;
        } catch (err) {
            console.log(err);
            console.log("新しいワードウルフの再投票データ作れんかったよ");
            return false;
        }
    }

    /**
     * 投票データを初期化する
     *
     */
    async initializeVote() {
        const userNumber = await this.getUserNumber();
        let votes = [];
        let status = [];
        for (let i = 0; i < userNumber; i++) {
            votes.push(0);
            status.push(false);
        }
        const query = {
            text: `UPDATE ${this.vote} set numbers = $1, status = $2 where pl_id = $3`,
            values: [votes, status, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Initialized Crazy-noisy Vote");
        } catch (err) {
            console.log(err);
            console.log("投票データ初期化できんかった");
        }
    }

    /**
     * 再投票データが存在するかを返す
     *
     * @returns
     */
    async hasRevote() {
        const query = {
            text: `SELECT pl_id FROM ${this.revote} WHERE pl_id = $1`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            if (res.rowCount == 1) {
                return true;
            } else if (res.rowCount > 1) {
                throw "同じpl_idの再投票データが二個以上あるよ"
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
        }
    }

    async initializeRevote(candidateIndexes) {
        const query = {
            text: `UPDATE ${this.revote} set indexes = $1 where pl_id = $3`,
            values: [candidateIndexes, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Initialized Crazy-noisy Revote");
        } catch (err) {
            console.log(err);
            console.log("再投票データ初期化できんかった");
        }
    }



    /**
     * 最も得票数の多いユーザーのインデックスを返す
     * ※注意：最多得票数が並んでいるときは使わない！
     *
     * @returns
     */
    async getMostVotedUserIndex() {
        const voteNumbers = await this.getVoteNumbers();
        let res = -1;
        let max = -1;
        for (let i = 0; i < voteNumbers.length; i++) {
            if (voteNumbers[i] > max) {
                max = voteNumbers[i];
                res = i;
            }
        }
        return res;
    }

    /**
     * 再投票で最多得票者が複数出た場合に最多得票者の中から処刑者をランダムで選ぶ
     * そのユーザーのインデックスを返す
     *
     * @param {*} userIndexes
     * @returns
     */
    async chooseExecutorIndex(userIndexes) {
        const index = Math.floor(Math.random() * userIndexes.length); // これは返さない
        return userIndexes[index];
    }


    /**
     * 勝者のインデックスを配列で返す
     *
     * @param {*} isGuruWinner
     * @returns
     * @memberof CrazyNoisy
     */
    async getWinnerIndexes(isGuruWinner) {
        const positions = await this.getPositions();
        let res = [];
        for (let i = 0; i < positions.length; i++) {

            if (isGuruWinner) { // 教団陣営勝利なら
                if (positions[i] == this.guru || positions[i] == this.fanatic) {
                    res.push(i);
                }
            } else { // 市民陣営勝利なら
                if (positions[i] == this.detective || positions[i] == this.citizen) {
                    res.push(i);
                }
            }

        }
        return res;
    }

    /**
     * 自分以外の名前の配列
     *
     * @param {*} userIndex
     * @returns
     * @memberof CrazyNoisy
     */
    async getActionTargetsDisplayNames(userIndex) {
        const displayNames = await this.getDisplayNames();

        displayNames.splice(userIndex, 1);
        return displayNames;
    }


    /**
     * 自分以外のuserIdの配列
     *
     * @param {*} userIndex
     * @returns
     * @memberof CrazyNoisy
     */
    async getActionTargetsUserIds(userIndex) {
        const userIds = await this.getUserIds();
        userIds.splice(userIndex, 1);
        return userIds;
    }

    /**
     * 入力のuserIdが対象者に含まれるかどうか
     *
     * @param {*} userIndex
     * @param {*} targetUserId
     * @returns
     * @memberof CrazyNoisy
     */
    async actionTargetUserIdExists(userIndex, targetUserId) {
        const userIds = await this.getActionTargetsUserIds(userIndex);
        let res = false;
        for (let userId of userIds) {
            if (targetUserId == userId) {
                res = true;
            }
        }
        return res;
    }




}

module.exports = CrazyNoisy;