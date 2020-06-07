const { Client } = require('pg')
const pg = new Client(process.env.DATABASE_URL)

pg.connect().catch((error) => {
    console.log('Error connecting to database', error)
})

const Game = require("./Game")
const ParticipantList = require("./ParticipantList");
const commonFunction = require("../template/functions/commonFunction");

class PlayingGame extends ParticipantList {


    /**
     *Creates an instance of PlayingGame.
     * @param {*} plId 参加者リストのid
     */

    constructor(plId) {
        super();
        this.plId = plId;
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

    async getGroupId() {
        return super.getGroupId(this.plId);
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

    async getUserNumber() {
        return super.getUserNumber(this.plId);
    }

    async getUserIndexes() {
        return super.getUserIndexes(this.plId);
    }

    async updateIsPlayingTrue(){
        return super.updateIsPlayingTrue(this.plId);
    }

    async updateIsRecruitingFalse(){
        return super.updateIsRecruitingFalse(this.plId);
    }

    /**
     * plIdのgameIdを返す
     *
     * @returns
     */
    async getGameId() {
        const query = {
            text: 'SELECT game_id FROM playing_game WHERE pl_id = $1;',
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].game_id;
        } catch (err) {
            console.log(err);
            console.log("ゲームidとってこれんやった");
        }
    }

    /**
     * プレイ中のゲームの名前を返す
     *
     * @returns
     */

    async getGameName() {
        try {
            const gameId = await this.getGameId()
            const gameName = await Game.getGameName(gameId);
            return gameName;
        } catch (err) {
            console.log(err);
            console.log("プレイ中のゲームの名前とってこれんやった");
        }
    }

    /**
     * 設定名の配列を取得
     *
     * @returns
     * @memberof PlayingGame
     */
    async getGameSettingNames(){
        try {
            const gameId = await this.getGameId()
            const settingNames = await Game.getSettingNames(gameId);
            return settingNames;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 設定名からインデックスを取得
     *
     * @param {*} name
     * @returns
     * @memberof PlayingGame
     */
    async getSettingIndex(name){
        const settingNames = await this.getGameSettingNames();
        let res = -1;
        for(let i=0;i<settingNames.length;i++){
            if(settingNames[i]==name){
                res = i;
            }
        }
        return res;
    }


    /**
     * 指定されたplId,gameIdのPlayingGameデータを挿入
     *
     * @param {*} gameId
     * @returns
     */
    async createPlayingGame(gameId) {
        const query = {
            text: 'INSERT INTO playing_game (pl_id,game_id) VALUES ($1,$2);',
            values: [this.plId, gameId]
        }
        try {
            await pg.query(query);
            console.log("Playing Game Inserted");
        } catch (err) {
            console.log(err);
            console.log("新しい進行中ゲーム作れんかったよ");
        }
    }

    async updateSettingStatus(settingStatus){
        const query = {
            text: `UPDATE playing_game set setting_status = $1 where pl_id = $2`,
            values: [settingStatus, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated setting-status");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * データが存在するかどうか
     *
     * @returns
     * @memberof PlayingGame
     */
    async exists(){
        const query = {
            text: `SELECT pl_id FROM playing_game WHERE pl_id = $1`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            if (res.rowCount == 1) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
        }
    }

    

    /**
     * 進行ステータスを設定
     *
     * @param {*} name
     */
    async updateStatus(name) {
        const query = {
            text: `UPDATE playing_game set status = $1 where pl_id = $2`,
            values: [name, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated status");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 進行ステータスを取得
     *
     * @returns
     */
    async getStatus() {
        const query = {
            text: `SELECT status FROM playing_game WHERE pl_id = $1;`,
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
     * 設定のステータスを取得
     *
     * @returns
     * @memberof PlayingGame
     */
    async getSettingStatus() {
        const query = {
            text: `SELECT setting_status FROM playing_game WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].setting_status;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 設定が完了しているかどうか
     *
     * @returns
     * @memberof PlayingGame
     */
    async isSettingCompleted(){
        const settingStatus = await this.getSettingStatus();
        let res = true;
        for(let settingState of settingStatus){
            if(!settingState){
                res = false;
            }
        }
        return res;
    }

    /**
     * 設定のステータスのインデックス番目をtrueに
     *
     * @param {*} index
     * @memberof PlayingGame
     */
    async updateSettingStateTrue(index) {
        let settingStatus = await this.getSettingStatus();
        settingStatus[index] = true;
        const query = {
            text: `UPDATE playing_game set setting_status = $1 where pl_id = $2`,
            values: [settingStatus, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated setting-state true");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 設定ステータスのインデックス番目をfalseに
     *
     * @param {*} index
     * @memberof PlayingGame
     */
    async updateSettingStateFalse(index) {
        let settingStatus = await this.getSettingStatus();
        settingStatus[index] = false;
        const query = {
            text: `UPDATE playing_game set setting_status = $1 where pl_id = $2`,
            values: [settingStatus, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated setting-state false");
        } catch (err) {
            console.log(err);
        }
    }


    /**
     * 日付を更新
     *
     * @memberof PlayingGame
     */
    async updateDay() {
        const query = {
            text: `UPDATE changing_setting set day = day + 1 where pl_id = $1`,
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
     * 日付を取得
     *
     * @returns
     * @memberof PlayingGame
     */
    async getDay() {
        const query = {
            text: `SELECT day from playing_game where pl_id = $1`,
            values: [this.plId]
        };
        try {
            const res = await pg.query(query);
            return res.rows[0].day;
        } catch (err) {
            console.log(err);
        }
    }

    // ここから投票に関する関数

    /**
     * 投票データ作成
     *
     * @memberof PlayingGame
     */
    async createVote() {
        const userNumber = await this.getUserNumber();
        const day = await this.getDay();
        let indexes = [];
        let votes = [];
        let status = [];
        for (let i = 0; i < userNumber; i++) {
            indexes.push(i);
            votes.push(0);
            status.push(false);
        }

        const query = {
            text: `INSERT INTO vote (pl_id,day,indexes,numbers,status) VALUES ($1,$2,$3,$4,$5);`,
            values: [this.plId, day, indexes, votes, status]
        }
        try {
            await pg.query(query);
            console.log("Vote Inserted");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 投票候補者の配列取得
     *
     * @returns
     * @memberof PlayingGame
     */
    async getVoteIndexes() {
        const day = await this.getDay();
        const query = {
            text: `SELECT indexes FROM vote WHERE pl_id = $1 AND day = $2 AND voting = true`,
            values: [this.plId, day]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].indexes;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 得票数取得
     *
     * @returns
     * @memberof PlayingGame
     */
    async getVoteNumbers() {
        const day = await this.getDay();
        const query = {
            text: `SELECT numbers FROM vote WHERE pl_id = $1 AND day = $2 AND voting = true`,
            values: [this.plId, day]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].numbers;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 投票済みステータス取得
     *
     * @returns
     * @memberof PlayingGame
     */
    async getVoteStatus() {
        const day = await this.getDay();
        const query = {
            text: `SELECT status FROM vote WHERE pl_id = $1 AND day = $2 AND voting = true`,
            values: [this.plId, day]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].status;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 投票回数を返す
     *
     * @returns
     * @memberof PlayingGame
     */
    async getVoteCount(){
        const day = await this.getDay();
        const query = {
            text: `SELECT count FROM vote WHERE pl_id = $1 AND day = $2 AND voting = true`,
            values: [this.plId, day]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].count;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 入力が候補者かどうか
     *
     * @param {*} index
     * @returns
     * @memberof PlayingGame
     */
    async isUserCandidate(index){
        const voteIndexes = await this.getVoteIndexes();
        let res = false;
        for(let voteIndex of voteIndexes){
            if(index == voteIndex){
                res = true;
            }
        }
        return res;
    }

    /**
     * ユーザーが投票済みかどうか
     *
     * @param {*} userIndex
     * @returns
     * @memberof PlayingGame
     */
    async isVotedUser(userIndex) {
        const status = await this.getVoteStatus();
        return status[userIndex];
    }

    /**
     * 投票が完了しているかどうか
     *
     * @returns
     * @memberof PlayingGame
     */
    async isVoteCompleted() {
        const status = await this.getVoteStatus();
        let res = true;
        for (let state of status) {
            if (!state) {
                res = false
            }
        }
        return res;
    }

    /**
     * 得票数更新
     *
     * @param {*} userIndex
     * @memberof PlayingGame
     */
    async updateVoteNumber(userIndex) {
        const day = await this.getDay();
        let numbers = await this.getVoteNumbers();
        numbers[userIndex] += 1; // 得票数1追加
        const query = {
            text: `UPDATE vote set numbers = $1 where pl_id = $2 AND day = $3 AND voting = true`,
            values: [numbers, this.plId, day]
        };
        try {
            await pg.query(query);
            console.log("Updated vote number");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 投票済みステータス更新
     *
     * @param {*} userIndex
     * @memberof PlayingGame
     */
    async updateVoteState(userIndex) {
        const day = await this.getDay();
        let status = await this.getVoteStatus();
        if (!status[userIndex]) {
            status[userIndex] = true;
        } else {
            throw "既に投票済み";
        }
        const query = {
            text: `UPDATE vote set status = $1 where pl_id = $2 AND day = $3 AND voting = true`,
            values: [status, this.plId, day]
        };
        try {
            await pg.query(query);
            console.log("Updated vote state");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 最多得票者が複数いるかどうか
     *
     * @returns
     * @memberof PlayingGame
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
     * 最多得票数取得
     *
     * @returns
     * @memberof PlayingGame
     */
    async getMostVotedNumber() {
        const voteNumbers = await this.getVoteNumbers();
        const number = Math.max.apply(null, voteNumbers);
        return number;
    }

    /**
     * 最多投票者を返す
     *
     * @returns
     * @memberof PlayingGame
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
     * 最多得票者の配列を取得
     *
     * @returns
     * @memberof PlayingGame
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
     * 2回目以降の投票作成
     *
     * @memberof PlayingGame
     */
    async createRevote(indexes){
        const userNumber = await this.getUserNumber();
        const day = await this.getDay();
        const count = await this.getVoteCount() + 1;
        await this.updateVotingFalse();
        let votes = [];
        let status = [];
        for (let i = 0; i < userNumber; i++) {
            votes.push(0);
            status.push(false);
        }

        const query = {
            text: `INSERT INTO vote (pl_id,day,indexes,numbers,status,count) VALUES ($1,$2,$3,$4,$5,$6);`,
            values: [this.plId, day, indexes, votes, status, count]
        }
        try {
            await pg.query(query);
            console.log("Revote Inserted");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 最多得票者が複数いるときに処刑者のインデックスを返す
     *
     * @returns
     * @memberof PlayingGame
     */
    async chooseExecutorIndex() {
        const userIndexes = await this.getMostVotedUserIndexes();
        const index = Math.floor(Math.random() * userIndexes.length); // これは返さない
        return userIndexes[index];
    }

    /**
     * 投票データの使用中ステータスをfalseに
     *
     * @memberof PlayingGame
     */
    async updateVotingFalse(){
        const day = await this.getDay();
        const query = {
            text: `UPDATE vote set voting = false where pl_id = $1 AND day = $2 AND voting = true`,
            values: [this.plId, day]
        };
        try {
            await pg.query(query);
            console.log("Updated voting false");
        } catch (err) {
            console.log(err);
        }
    }


    // ここからdiscussに関する関数

    /**
     * タイマー設定を取得
     *
     * @returns
     * @memberof PlayingGame
     */
    async getTimer() {
        const query = {
            text: `SELECT timer FROM playing_game WHERE pl_id = $1`,
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
     * タイマー設定を文字列で取得
     *
     * @returns
     * @memberof PlayingGame
     */
    async getTimerString() {
        const timer = await this.getTimer();
        let timerString = "";
        if (timer.hour != undefined) {
            timerString += timer.hour + "時間";
        }
        if (timer.minutes != undefined) {
            timerString += timer.minutes + "分";
        }
        if (timer.seconds != undefined) {
            timerString += timer.seconds + "秒"
        }

        return timerString;
    }

    
    /**
     * タイマーの値を設定
     *
     * @param {*} interval
     * @memberof PlayingGame
     */
    async updateTimer(interval) {
        const query = {
            text: `UPDATE playing_game set timer = $1 where pl_id = $2`,
            values: [interval, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated timer");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * discussテーブルにデータを挿入
     *
     * @memberof PlayingGame
     */
    async createDiscuss(){
        const startTime = await commonFunction.getCurrentTime();
        const timer = await this.getTimer();
        const day = await this.getDay();

        const query1 = {
            text: 'INSERT INTO discuss (pl_id,day,start_time) VALUES ($1,$2,$3)',
            values: [this.plId, day,startTime]
        }
        const query2 = {
            text: `update discuss set end_time = start_time + $1 WHERE pl_id = $2 AND day = $3`,
            values: [timer, this.plId, day]
        }
        try {
            await pg.query(query1);
            await pg.query(query2);
            console.log("Discuss Inserted");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 時間が終了しているかどうか
     *
     * @returns
     * @memberof PlayingGame
     */
    async isOverTime() {
        const currentTime = await commonFunction.getCurrentTime();
        const day = await this.getDay();
        const second = "0 second"
        const query = {
            text: `SELECT ((end_time - $1 ) < $2 ) as ans FROM discuss WHERE pl_id = $3 AND day = $4`,
            values: [currentTime, second, this.plId,day]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].ans;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 残り時間取得
     *
     * @returns
     * @memberof PlayingGame
     */
    async getRemainingTime() {
        const currentTime = await commonFunction.getCurrentTime();
        const day = await this.getDay();

        const query1 = {
            text: `SELECT EXTRACT(minutes from (end_time - $1 )) AS minutes FROM discuss WHERE pl_id = $2 AND day = $3`,
            values: [currentTime, this.plId,day]
        }
        const query2 = {
            text: `SELECT EXTRACT(second from (end_time - $1 )) AS second FROM discuss WHERE pl_id = $2 AND day = $3`,
            values: [currentTime, this.plId,day]
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
     * 議論中のplId取得
     *
     * @returns
     * @memberof PlayingGame
     */
    async getDiscussingPlIds() {
        const query = {
            text: `SELECT pl_id FROM playing_game WHERE status = 'discuss'`
        }
        try {
            const res = await pg.query(query);
            let plIds = []
            for (let i = 0; i < res.rowCount; i++) {
                plIds.push(res.rows[i].pl_id);
            }
            return plIds;
        } catch (err) {
            console.log(err);
        }
    }

}

module.exports = PlayingGame;