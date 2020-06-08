const { Client } = require('pg')
const pg = new Client(process.env.DATABASE_URL)

pg.connect().catch((error) => {
    console.log('Error connecting to database', error)
})

require('date-utils');
const systemLogger = require("../modules/log4js").systemLogger;

const ParticipantList = require("./ParticipantList");
const PlayingGame = require("./PlayingGame");
const Game = require("./Game");
const commonFunction = require("../template/functions/commonFunction");

/**
 * 関連テーブル一覧
 * 
 * word_wolf_status
 *  pl_id(int) : 参加者リストid
 *  genre(boolean) : ジャンルを選んだかどうか
 *  wolf_number(boolean) : ウルフ数を選んだかどうか
 *  timer(boolean) : タイマー時間を選んだかどうか(未設定)
 *  confirm(boolean) : 設定を確認したかどうか
 *  finished(boolean) : 話し合いが終了したかどうか
 *  winner(boolean) : 勝者を発表したかどうか
 *  result(boolean) : ワードを公開したかどうか
 * 
 * word_wolf_setting
 *  pl_id(int) : 参加者リストid
 *  word_set_id(int) : 使用するワードセット
 *  is_reverse(boolean) : trueなら市民用はword1、falseならword2
 *  wolf_indexes(int[]) : ウルフのインデックス（参加者リストのuser_idsに対応）
 *  wolf_number(int[]) : ウルフの数
 *  timer(int) : 話し合い時間
 *  start_time(timestamp) : 話し合いスタート時刻
 * 
 * word_wolf_vote
 *  pl_id(int) : 参加者リストid
 *  numbers(int[]) : ユーザーの得票数の配列
 *  status(boolean[]) : ユーザーが投票済み
 * 
 * word_wolf_revote
 *  pl_id(int) : 参加者リストid
 *  indexes(int[]) : 再投票の候補者の配列
 * 
 * word_set
 *  id(int) : ワードセットid
 *  word1(varchar(33)) : 単語1
 *  word2(varchar(33)) : 単語2
 *  genre_id(int) : ジャンルid
 *  depth(int) : 単語の深さ
 * 
 * word_genre
 *  id(int) : ワードジャンルid
 *  name(varchar) : ジャンル名
 *  
 *
 * @class WordWolf
 */

class WordWolf extends PlayingGame {


    /**
     *Creates an instance of WordWolf.
     * @param {*} plId
     */

    constructor(plId) {
        super();
        this.plId = plId;
        this.setting = "word_wolf_setting";
        this.status = "word_wolf_status";
        this.vote = "word_wolf_vote";
        this.revote = "word_wolf_revote";
        this.gameId = 1;
    }

    /**
     * PlayingGameデータにデフォルトの設定ステータス挿入
     * timerのみtrue
     *
     * @memberof WordWolf
     */
    async updateDefaultSettingStatus() {
        const settingNames = await Game.getSettingNames(this.gameId);
        let settingStatus = [];
        for (let i = 0; i < settingNames.length; i++) {
            if (settingNames[i] == "timer") {
                settingStatus[i] = true;
            }else{
                settingStatus[i] = false;
            }
        }
        await this.updateSettingStatus(settingStatus);
    }

    /**
     * ワードウルフの設定データを挿入する
     * is_reverse(ワードセットの順番を入れ替えるかどうか)だけデフォルトで入れておく
     *
     * @returns
     */

    async createWordWolfSetting() {
        const isReverse = await this.chooseIsReverse();
        const query = {
            text: `INSERT INTO ${this.setting} (pl_id,is_reverse) VALUES ($1,$2);`,
            values: [this.plId, isReverse]
        }
        try {
            await pg.query(query);
            console.log("Word-Wolf Setting Inserted");
            return true;
        } catch (err) {
            systemLogger.error(err);
            console.log("新しいワードウルフの設定作れんかったよ");
            return false;
        }
    }


    /**
     * ワードウルフの設定データがあるかどうかを返す
     *
     * @returns
     */
    async hasWordWolfSetting() {
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
            systemLogger.error(err);
        }
    }


    // ここからワードに関する関数

    /**
     * 与えられたgenreIdに一致したwordSetIdを配列で返す
     *
     * @param {*} genreId
     * @returns
     */
    async getWordSetIdsMatchGenreId(genreId) {
        const query = {
            text: `SELECT id FROM word_set WHERE genre_id = $1;`,
            values: [genreId]
        }
        try {
            const res = await pg.query(query);
            let wordSetIds = [];
            for (let i = 0; i < res.rowCount; i++) {
                wordSetIds.push(res.rows[i].id);
            }
            return wordSetIds;
        } catch (err) {
            systemLogger.error(err);
        }
    }


    /**
     * 与えられたジャンルのワードセットをランダムに選んで返す
     *
     * @param {*} genreId
     * @returns
     */
    async chooseWordSetIdMatchGenreId(genreId) {
        const wordSetIds = await this.getWordSetIdsMatchGenreId(genreId);
        console.log("wordSetIds :" + wordSetIds);
        const index = Math.floor(Math.random() * wordSetIds.length);
        return wordSetIds[index];
    }

    /**
     * ワードの順番（ウルフ用とそれ以外用）をひっくり返すかどうかをランダムで決めて返す
     *
     * @returns
     */
    async chooseIsReverse() {
        const i = Math.floor(Math.random() * 2);
        if (i == 1) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * ワードセットのidを返す
     *
     * @returns
     */

    async getWordSetId() {
        const query = {
            text: `SELECT word_set_id FROM ${this.setting} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].word_set_id;
        } catch (err) {
            systemLogger.error(err);
        }
    }

    /**
     * ワードセットのidを更新する
     *
     * @param {*} genreId
     */
    async updateWordSetIdMatchGenreId(genreId) {
        const wordSetId = await this.chooseWordSetIdMatchGenreId(genreId);

        const query = {
            text: `UPDATE ${this.setting} set word_set_id = $1 where pl_id = $2`,
            values: [wordSetId, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated word-set-id");
        } catch (err) {
            systemLogger.error(err);
            console.log("単語セットのid設定できんかった");
        }
    }


    /**
     * ワードのジャンルidを返す
     *
     * @returns
     */
    async getGenreId() {
        const wordSetId = await this.getWordSetId();
        const query = {
            text: `SELECT genre_id FROM word_set WHERE id = $1;`,
            values: [wordSetId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].genre_id;
        } catch (err) {
            systemLogger.error(err);
        }
    }


    /**
     * 与えられたgenreIdの名前を返す
     *
     * @param {*} genreId
     * @returns
     */
    async getGenreName(genreId) {
        const query = {
            text: `SELECT name FROM word_genre WHERE id = $1;`,
            values: [genreId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].name;
        } catch (err) {
            systemLogger.error(err);
        }
    }

    /**
     * すべてのジャンルのidと名前を連想配列にして返す
     * 配列にするとidふりなおしたときだるいけん辞書にしとく
     *
     * @returns
     */
    async getAllGenreIdAndName() {
        const query = {
            text: `SELECT id, name FROM word_genre`
        }
        try {
            let obj = {};
            const res = await pg.query(query);
            for (let i = 0; i < res.rowCount; i++) {
                obj[res.rows[i].id] = res.rows[i].name;
            }
            console.log(obj);
            return obj;
        } catch (err) {
            systemLogger.error(err);
        }
    }

    /**
     * 与えられたジャンルの名前のジャンルidを返す
     *
     * @param {*} genreName
     * @returns
     */
    async getGenreIdFromName(genreName) {
        const query = {
            text: `SELECT id FROM word_genre WHERE name = $1`,
            values: [genreName]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].id;
        } catch (err) {
            systemLogger.error(err);
        }
    }

    /**
     * ジャンルの名前が存在するかどうかを返す
     *
     * @param {*} text
     * @returns
     */
    async genreNameExists(text) {
        const query = {
            text: `SELECT id FROM word_genre WHERE name = $1`,
            values: [text]
        }
        try {
            const res = await pg.query(query);
            if (res.rowCount == 1) {
                return true;
            } else if (res.rowCount > 1) {
                throw "同じ名前のジャンルが二個以上あるよ"
            } else {
                return false;
            }
        } catch (err) {
            systemLogger.error(err);
        }
    }

    /**
     * isReverseの値を返す
     *
     * @returns
     */
    async getIsReverse() {
        const query = {
            text: `SELECT is_reverse FROM ${this.setting} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].is_reverse;
        } catch (err) {
            systemLogger.error(err);
        }
    }

    /**
     * 市民用のワードを返す
     * is_reverseがfalseなら市民用はword1
     *
     * @returns
     */
    async getCitizenWord() {
        const wordSetId = await this.getWordSetId();
        const isReverse = await this.getIsReverse();

        let query = {}
        if (!isReverse) {
            query = {
                text: `SELECT word1 FROM word_set WHERE id = $1;`,
                values: [wordSetId]
            };
        } else {
            query = {
                text: `SELECT word2 FROM word_set WHERE id = $1;`,
                values: [wordSetId]
            };
        }

        try {
            const res = await pg.query(query);
            if (!isReverse) {
                return res.rows[0].word1;
            } else {
                return res.rows[0].word2;
            }
        } catch (err) {
            systemLogger.error(err);
        }
    }


    /**
     * ウルフ用のワードを返す
     * is_reverseがfalseならウルフ用はword2
     *
     * @returns
     */
    async getWolfWord() {
        const wordSetId = await this.getWordSetId();
        const isReverse = await this.getIsReverse();

        let query = {}
        if (!isReverse) {
            query = {
                text: `SELECT word2 FROM word_set WHERE id = $1;`,
                values: [wordSetId]
            };
        } else {
            query = {
                text: `SELECT word1 FROM word_set WHERE id = $1;`,
                values: [wordSetId]
            };
        }

        try {
            const res = await pg.query(query);
            if (!isReverse) {
                return res.rows[0].word2;
            } else {
                return res.rows[0].word1;
            }
        } catch (err) {
            systemLogger.error(err);
        }
    }

    /**
     * 与えられたdepthに一致したwordSetIdを配列で返す
     *
     * @param {*} depth
     * @returns
     */
    async getWordSetIdsMatchDepth(depth) {
        const query = {
            text: `SELECT id FROM word_set WHERE depth = $1;`,
            values: [depth]
        }
        try {
            const res = await pg.query(query);
            let wordSetIds = [];
            for (let i = 0; i < res.rowCount; i++) {
                wordSetIds.push(res.rows[i].id);
            }
            return wordSetIds;
        } catch (err) {
            systemLogger.error(err);
        }
    }


    /**
     * 与えられたジャンルのワードセットをランダムに選んで返す
     *
     * @param {*} depth
     * @returns
     */
    async chooseWordSetIdMatchDepth(depth) {
        const wordSetIds = await this.getWordSetIdsMatchDepth(depth);
        console.log("wordSetIds :" + wordSetIds);
        const index = Math.floor(Math.random() * wordSetIds.length);
        return wordSetIds[index];
    }

    /**
     * ワードセットのidを更新する
     *
     * @param {*} depth
     */
    async updateWordSetIdMatchDepth(depth) {
        const wordSetId = await this.chooseWordSetIdMatchDepth(depth);

        const query = {
            text: `UPDATE ${this.setting} set word_set_id = $1 where pl_id = $2`,
            values: [wordSetId, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated word-set-id");
        } catch (err) {
            systemLogger.error(err);
            console.log("単語セットのid設定できんかった");
        }
    }


    /**
     * ワードのdepthを返す
     *
     * @returns
     */
    async getDepth() {
        const wordSetId = await this.getWordSetId();
        const query = {
            text: `SELECT depth FROM word_set WHERE id = $1;`,
            values: [wordSetId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].depth;
        } catch (err) {
            systemLogger.error(err);
        }
    }



    // ここまでワードに関する関数

    // ここからウルフの設定に関する関数

    /**
     * ウルフの人数を設定する
     *
     * @param {*} wolfNumber
     */
    async updateWolfNumber(wolfNumber) {
        const query = {
            text: `UPDATE ${this.setting} set wolf_number = $1 where pl_id = $2`,
            values: [wolfNumber, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated wolf-number");
        } catch (err) {
            systemLogger.error(err);
            console.log("ウルフの人数設定できんかった");
        }
    }

    /**
     * ウルフの人数を返す
     *
     * @returns
     */
    async getWolfNumber() {
        const query = {
            text: `SELECT wolf_number FROM ${this.setting} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].wolf_number;
        } catch (err) {
            systemLogger.error(err);
        }
    }

    /**
     * 与えられたwolfNumberの数だけウルフのインデックスを重複のないように選んで返す
     * このインデックスは0から「参加者リストのuserの数-1」まで
     *
     * @param {*} wolfNumber
     * @returns
     */
    async chooseWolfIndexes(wolfNumber) {
        const userNumber = await this.getUserNumber();

        const wolfIndexes = await commonFunction.chooseRandomIndexes(userNumber, wolfNumber);
        return wolfIndexes;
    }


    /**
     * ウルフの番号を設定する
     * chooseWolfIndexes参照
     *
     * @param {*} wolfNumber
     */
    async updateWolfIndexes(wolfNumber) {
        await this.updateWolfNumber(wolfNumber); // ウルフの数をアップデート
        const wolfIndexes = await this.chooseWolfIndexes(wolfNumber);

        const query = {
            text: `UPDATE ${this.setting} set wolf_indexes = $1 where pl_id = $2`,
            values: [wolfIndexes, this.plId]
        };
        try {
            await pg.query(query).then(console.log("Updated wolf-indexes"));
        } catch (err) {
            systemLogger.error(err);
        }
    }

    /**
     * ウルフの番号を取得する
     *
     * @returns
     */
    async getWolfIndexes() {
        const query = {
            text: `SELECT wolf_indexes FROM ${this.setting} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].wolf_indexes;
        } catch (err) {
            systemLogger.error(err);
        }
    }

    /**
     * ウルフの人数の選択肢の配列を返す
     * 整数の配列
     * 1人～参加者の半分未満となるうち最大の人数
     *
     * @returns
     */
    async getWolfNumberOptions() {
        const userNumber = await this.getUserNumber();
        const maxWolfNumber = await commonFunction.calculateMaxNumberLessThanHalf(userNumber);

        let res = [];
        for (let i = 1; i <= maxWolfNumber; i++) {
            res.push(i);
        }
        if (userNumber == 2) {
            res.push(1);
        }
        return res;
    }

    /**
     * ウルフの人数の選択肢の整数配列の要素それぞれに「人」をつけたものを返す
     *
     * @returns
     */
    async getWolfNumberNinOptions() {
        const wolfNumberOptions = await this.getWolfNumberOptions();
        let wolfNumberNinOptions = [];
        for (let i = 0; i < wolfNumberOptions.length; i++) {
            wolfNumberNinOptions[i] = wolfNumberOptions[i] + "人";
        }
        return wolfNumberNinOptions;
    }

    /**
     * テキストがウルフの人数に一致するかどうかを返す
     * 1人、2人などじゃないとtrueにならない
     *
     * @param {*} text
     * @returns
     */
    async wolfNumberExists(text) {
        const wolfNumberNinOptions = await this.getWolfNumberNinOptions();
        let res = false;
        for (let wolfNumberNinOption of wolfNumberNinOptions) {
            if (text == wolfNumberNinOption) {
                res = true;
            }
        }
        return res;
    }

    /**
     * テキストからウルフの人数を返す
     *
     * @param {*} text
     * @returns
     */
    async getWolfNumberFromText(text) {

        const wolfNumberNinOptions = await this.getWolfNumberNinOptions();
        let wolfNumber = -1;
        for (let i = 0; i < wolfNumberNinOptions.length; i++) {
            if (text == wolfNumberNinOptions[i]) {
                wolfNumber = i + 1;
            }
        }
        if (wolfNumber != -1) {
            return wolfNumber;
        } else {
            throw "ウルフの人数と一致しないよ"
        }

    }

    /**
     * 与えられたuserIndexのユーザーがウルフかどうかを返す
     *
     * @param {*} userIndex
     * @returns
     */
    async isUserWolf(userIndex) {
        const wolfIndexes = await this.getWolfIndexes();
        let res = false;
        for (let wolfIndex of wolfIndexes) {
            if (userIndex == wolfIndex) {
                res = true;
            }
        }
        return res;
    }


    // ここまでウルフに関する関数

    // ここから狂人に関する関数


    /**
     * 狂人の人数を設定する
     *
     * @param {*} lunaticNumber
     */
    async updateLunaticNumber(lunaticNumber) {
        const query = {
            text: `UPDATE ${this.setting} set lunatic_number = $1 where pl_id = $2`,
            values: [lunaticNumber, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated lunatic-number");
        } catch (err) {
            systemLogger.error(err);
            console.log("狂人の人数設定できんかった");
        }
    }

    /**
     * 狂人の人数を返す
     *
     * @returns
     */
    async getLunaticNumber() {
        const query = {
            text: `SELECT lunatic_number FROM ${this.setting} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].lunatic_number;
        } catch (err) {
            systemLogger.error(err);
        }
    }

    /**
     * 与えられたlunaticNumberの数だけ狂人のインデックスを重複のないように選んで返す
     * このインデックスは0から「参加者リストのuserの数-1」まで
     *
     * @param {*} lunaticNumber
     * @returns
     */
    async chooseLunaticIndexes(lunaticNumber) {
        const userNumber = await this.getUserNumber();

        const lunaticIndexes = await commonFunction.chooseRandomIndexes(userNumber, lunaticNumber);
        return lunaticIndexes;
    }


    /**
     * 狂人の番号を設定する
     * chooseLunaticIndexes参照
     *
     * @param {*} lunaticNumber
     */
    async updateLunaticIndexes(lunaticNumber) {
        await this.updateLunaticNumber(lunaticNumber); // ウルフの数をアップデート
        const lunaticIndexes = await this.chooseLunaticIndexes(lunaticNumber);

        const query = {
            text: `UPDATE ${this.setting} set lunatic_indexes = $1 where pl_id = $2`,
            values: [lunaticIndexes, this.plId]
        };
        try {
            await pg.query(query).then(console.log("Updated lunatic-indexes"));
        } catch (err) {
            systemLogger.error(err);
        }
    }

    /**
     * 狂人の番号を取得する
     *
     * @returns
     */
    async getLunaticIndexes() {
        const query = {
            text: `SELECT lunatic_indexes FROM ${this.setting} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].lunatic_indexes;
        } catch (err) {
            systemLogger.error(err);
        }
    }

    /**
     * 狂人の人数の選択肢の配列を返す
     * 整数の配列
     * とりあえず0人か1人かな～
     *
     * @returns
     */
    async getLunaticNumberOptions() {
        const userNumber = await this.getUserNumber();

        /*
        const maxLunaticNumber = await commonFunction.calculateMaxNumberLessThanHalf(userNumber);

        let res = [];
        for (let i = 1; i <= maxLunaticNumber; i++) {
            res.push(i);
        }
        return res;
        */

        return [0, 1];
    }

    /**
     * ウルフの人数の選択肢の整数配列の要素それぞれに「人」をつけたものを返す
     *
     * @returns
     */
    async getLunaticNumberNinOptions() {
        const lunaticNumberOptions = await this.getLunaticNumberOptions();
        let lunaticNumberNinOptions = [];
        for (let i = 0; i < lunaticNumberOptions.length; i++) {
            lunaticNumberNinOptions[i] = lunaticNumberOptions[i] + "人";
        }
        return lunaticNumberNinOptions;
    }

    /**
     * テキストがウルフの人数に一致するかどうかを返す
     * 1人、2人などじゃないとtrueにならない
     *
     * @param {*} text
     * @returns
     */
    async lunaticNumberExists(text) {
        const lunaticNumberNinOptions = await this.getLunaticNumberNinOptions();
        let res = false;
        for (let lunaticNumberNinOption of lunaticNumberNinOptions) {
            if (text == lunaticNumberNinOption) {
                res = true;
            }
        }
        return res;
    }

    /**
     * テキストからウルフの人数を返す
     *
     * @param {*} text
     * @returns
     */
    async getLunaticNumberFromText(text) {

        const lunaticNumberNinOptions = await this.getLunaticNumberNinOptions();
        let lunaticNumber = -1;
        for (let i = 0; i < lunaticNumberNinOptions.length; i++) {
            if (text == lunaticNumberNinOptions[i]) {
                lunaticNumber = i;
            }
        }
        if (lunaticNumber != -1) {
            return lunaticNumber;
        } else {
            throw "狂人の人数と一致しないよ"
        }

    }

    /**
     * 与えられたuserIndexのユーザーがウルフかどうかを返す
     *
     * @param {*} userIndex
     * @returns
     */
    async isUserLunatic(userIndex) {
        const lunaticIndexes = await this.getLunaticIndexes();
        let res = false;
        for (let lunaticIndex of lunaticIndexes) {
            if (userIndex == lunaticIndex) {
                res = true;
            }
        }
        return res;
    }

    // ここまで狂人の設定に関する関数

    async isUserWolfSide(userIndex) {
        const isUserWolf = await this.isUserWolf(userIndex);
        const isUserLunatic = await this.isUserLunatic(userIndex);
        let res = false;
        if (isUserWolf || isUserLunatic) {
            res = true;
        }
        return res;
    }



    /**
     * ParticipantListのメソッド転用
     * 参加者の人数を返す
     *
     * @returns
     */
    async getUserNumber() {
        const participantList = new ParticipantList();
        return participantList.getUserNumber(this.plId);
    }

    /**
     * ParticipantListの転用メソッド
     * 参加者のインデックスの配列を返す
     *
     * @returns
     */
    async getUserIndexes() {
        const participantList = new ParticipantList();
        return participantList.getUserIndexes(this.plId);
    }






    // word_wolf_statusテーブルに関する関数

    /**
     * ワードウルフの進捗状況データを挿入する
     * デフォルトではすべてfalse
     *
     * @returns
     */
    async createWordWolfStatus() {
        const query = {
            text: `INSERT INTO ${this.status} (pl_id) VALUES ($1);`,
            values: [this.plId]
        }
        try {
            await pg.query(query);
            console.log("Word-Wolf Setting Status Inserted");
            return true;
        } catch (err) {
            systemLogger.error(err);
            console.log("新しいワードウルフの設定の進捗データ作れんかったよ");
            return false;
        }
    }

    /**
     * ワードウルフの進捗状況データがあるかどうかを返す
     *
     * @returns
     */
    async hasWordWolfStatus() {
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
            systemLogger.error(err);
        }
    }

    // ここからgenre status

    /**
     * genreの選択状況をtrueにする
     *
     */
    async updateGenreStatusTrue() {
        const query = {
            text: `UPDATE ${this.status} set genre = true where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated genre status");
        } catch (err) {
            systemLogger.error(err);
        }
    }

    /**
     * genreの選択状況をfalseにする
     *
     */
    async updateGenreStatusFalse() {
        const query = {
            text: `UPDATE ${this.status} set genre = false where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated genre status to false");
        } catch (err) {
            systemLogger.error(err);
        }
    }

    /**
     * genreの選択状況を返す
     *
     * @returns
     */
    async getGenreStatus() {
        const query = {
            text: `SELECT genre FROM ${this.status} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].genre;
        } catch (err) {
            systemLogger.error(err);
        }
    }

    // ここまでgenre status

    // ここからwolf_number status

    /**
     * wolf_numberの選択状況をtrueにする
     *
     */
    async updateWolfNumberStatusTrue() {
        const query = {
            text: `UPDATE ${this.status} set wolf_number = true where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query).then(console.log("Updated wolf-number status"));
        } catch (err) {
            systemLogger.error(err);
            console.log("ウルフの人数の設定状況更新できんかった");
        }
    }

    /**
     * wolf_numberの選択状況をfalseにする
     *
     */
    async updateWolfNumberStatusFalse() {
        const query = {
            text: `UPDATE ${this.status} set wolf_number = false where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query).then(console.log("Updated wolf-number status to false"));
        } catch (err) {
            systemLogger.error(err);
            console.log("ウルフの人数の設定状況更新できんかった");
        }
    }

    /**
     * wolf_numberの選択状況を返す
     *
     * @returns
     */
    async getWolfNumberStatus() {
        const query = {
            text: `SELECT wolf_number FROM ${this.status} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].wolf_number;
        } catch (err) {
            systemLogger.error(err);
        }
    }

    // ここまでwolf_Number status

    // ここからlunatic status

    /**
     * lunaticの選択状況をtrueにする
     *
     */
    async updateLunaticStatusTrue() {
        const query = {
            text: `UPDATE ${this.status} set lunatic = true where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query).then(console.log("Updated lunatic status"));
        } catch (err) {
            systemLogger.error(err);
            console.log("狂人の人数の設定状況更新できんかった");
        }
    }

    /**
     * lunaticの選択状況をfalseにする
     *
     */
    async updateLunaticStatusFalse() {
        const query = {
            text: `UPDATE ${this.status} set lunatic = false where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query).then(console.log("Updated lunatic status to false"));
        } catch (err) {
            systemLogger.error(err);
            console.log("狂人の人数の設定状況更新できんかった");
        }
    }

    /**
     * lunaticの選択状況を返す
     *
     * @returns
     */
    async getLunaticStatus() {
        const query = {
            text: `SELECT lunatic FROM ${this.status} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].lunatic;
        } catch (err) {
            systemLogger.error(err);
        }
    }

    /**
     * 確認がNoだった場合に設定をリセットする
     *
     * @memberof WordWolf
     */
    async resetSettingStatus() {
        await this.updateGenreStatusFalse();
        await this.updateWolfNumberStatusFalse();
        await this.updateLunaticStatusFalse();
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
            systemLogger.error(err);
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
            systemLogger.error(err);
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
            systemLogger.error(err);
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
            systemLogger.error(err);
        }
    }

    /**
     * 話し合い終了ステータスをtrueにする
     *
     */
    async updateFinishedStatusTrue() {
        const query = {
            text: `UPDATE ${this.status} set finished = true where pl_id = $1`,
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated finished status");
        } catch (err) {
            systemLogger.error(err);
        }
    }

    /**
     * 話し合いが終了しているどうかを返す
     *
     * @returns
     */
    async getFinishedStatus() {
        const query = {
            text: `SELECT finished FROM ${this.status} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].finished;
        } catch (err) {
            systemLogger.error(err);
        }
    }

    /**
     * 勝者の発表状況をtrueにする
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
            systemLogger.error(err);
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
            systemLogger.error(err);
        }
    }

    /**
     * 結果の発表状況をtrueにする
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
            systemLogger.error(err);
        }
    }

    /**
     * 結果発表済みかどうかを返す
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
            systemLogger.error(err);
        }
    }

    // ここまでword_wolf_statusに関する関数


    /**
     * ParticipantListクラスのメソッド転用
     * 参加者の表示名の配列を返す
     *
     * @returns
     */
    async getDisplayNames() {
        const participantList = new ParticipantList();
        return participantList.getDisplayNames(this.plId);
    }

    /**
     * ParticipantListクラスのメソッド転用
     * インデックス番号の参加者の表示名を返す
     *
     * @param {*} userIndex
     */
    async getDisplayName(userIndex) {
        const participantList = new ParticipantList();
        return participantList.getDisplayName(userIndex, this.plId);
    }


    /**
     * ParticipantListクラスの転用メソッド
     * 与えられたインデックスのuserIdを返す
     *
     * @param {*} index
     * @returns
     */
    async getUserId(index) {
        const participantList = new ParticipantList();
        return participantList.getUserId(this.plId, index);
    }

    /**
     * ParticipantListクラスの転用メソッド
     * 参加者のuserIdの配列を返す
     *
     * @returns
     */
    async getUserIds() {
        const participantList = new ParticipantList();
        return participantList.getUserIds(this.plId);
    }


    /**
     * 投票データを挿入する
     * numbersは誰が何票入ってるかの配列
     * statusは誰が投票済みかの配列
     *
     * @returns
     */
    /* async createWordWolfVote() {
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
            console.log("Word-Wolf Vote Inserted");
            return true;
        } catch (err) {
            systemLogger.error(err);
            console.log("新しいワードウルフの投票データ作れんかったよ");
            return false;
        }
    } */


    /**
     * 得票数の配列を返す
     *
     * @returns
     */
    /* async getVoteNumbers() {
        const query = {
            text: `SELECT numbers FROM ${this.vote} WHERE pl_id = $1`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].numbers;
        } catch (err) {
            systemLogger.error(err);
        }
    } */

    /**
     * 投票状況の配列を返す
     *
     * @returns
     */
    /* async getVoteStatus() {
        const query = {
            text: `SELECT status FROM ${this.vote} WHERE pl_id = $1`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].status;
        } catch (err) {
            systemLogger.error(err);
        }
    } */

    /**
     * 与えられたuserIndexのユーザーの投票状況を返す
     *
     * @param {*} userIndex
     * @returns
     */
    /* async getVoteState(userIndex) {
        const status = await this.getVoteStatus();
        return status[userIndex];
    } */

    /**
     * 投票が全員完了しているか否かを返す
     *
     * @returns
     */
    /* async isVoteCompleted() {
        const status = await this.getVoteStatus();
        let res = true;
        for (let state of status) {
            if (!state) {
                res = false
            }
        }
        return res;
    } */

    /**
     * 与えられたuserIndexのユーザーの得票数を1増やす
     *
     * @param {*} userIndex
     */
    /* async updateVoteNumber(userIndex) {
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
            systemLogger.error(err);
        }
    } */

    /**
     * 与えられたuserIndexのユーザーの投票状況をtrueにする
     *
     * @param {*} userIndex
     */
    /* async updateVoteStatus(userIndex) {
        let status = await this.getVoteStatus();
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
            systemLogger.error(err);
        }
    } */

    /**
     * 最多得票者が複数いるかどうかを返す
     *
     * @returns
     */
    /* async multipleMostVotedUserExists() {
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
    } */

    /**
     * 最多得票数を返す
     *
     * @returns
     */
    /* async getMostVotedNumber() {
        const voteNumbers = await this.getVoteNumbers();
        const number = Math.max.apply(null, voteNumbers);
        return number;
    } */

    /**
     * 最も得票数の多いユーザーのインデックスの配列を返す
     * ※注意：最多得票者が1人のときは使わない！！
     *
     * @returns
     */
    /* async getMostVotedUserIndexes() {
        const voteNumbers = await this.getVoteNumbers();
        const mostVotedNumber = await this.getMostVotedNumber();
        let indexes = [];
        for (let i = 0; i < voteNumbers.length; i++) {
            if (voteNumbers[i] == mostVotedNumber) {
                indexes.push(i);
            }
        }
        return indexes;
    } */

    /**
     * 再投票の候補者の配列を取得する
     * 上の関数の結果と同じになるはず
     * 冗長かな...？そのうち消すかも
     *
     * @returns
     */
    /* async getRevoteCandidateIndexes() {
        const query = {
            text: `SELECT indexes FROM ${this.revote} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].indexes;
        } catch (err) {
            systemLogger.error(err);
            console.log("再投票の候補者取得できんかった");
        }
    } */

    /**
     * 与えられたテキストがユーザーインデックスかどうかを返す
     * 不正なpostback対策
     *
     * @param {*} text
     * @returns
     */
    /* async isUserIndex(text) {
        const userIndexes = await this.getUserIndexes();
        let res = false;
        for (let userIndex of userIndexes) {
            if (userIndex == text) {
                res = true;
            }
        }
        return res;
    } */

    /**
     * 与えられたテキストが再投票の候補者かどうかを返す
     * 基本的に表示するのは候補者の名前だけだが前のゲームの投票Flex Messageなどでpostbackを送ってくることも想定されるため
     *
     * @param {*} text
     * @returns
     */
    /* async isRevoteCandidateIndex(text) {
        const candidateIndexes = await this.getRevoteCandidateIndexes();
        let res = false;
        for (let candidateIndex of candidateIndexes) {
            if (text == candidateIndex) {
                res = true;
            }
        }
        return res;
    } */

    /**
     * 与えられたindexesで再投票データを作る
     * indexesには再投票の候補者のインデックスの配列が入る
     *
     * @returns
     */
    /* async createWordWolfRevote(candidateIndexes) {
        const query = {
            text: `INSERT INTO ${this.revote} (pl_id,indexes) VALUES ($1,$2);`,
            values: [this.plId, candidateIndexes]
        }
        try {
            await pg.query(query);
            console.log("Word-Wolf Revote Inserted");
            return true;
        } catch (err) {
            systemLogger.error(err);
            console.log("新しいワードウルフの再投票データ作れんかったよ");
            return false;
        }
    } */

    /**
     * 投票データを初期化する
     *
     */
    /* async initializeWordWolfVote() {
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
            console.log("Initialized Word-Wolf Vote");
        } catch (err) {
            systemLogger.error(err);
            console.log("投票データ初期化できんかった");
        }
    } */

    /**
     * 再投票データが存在するかを返す
     *
     * @returns
     */
    /* async isRevoting() {
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
            systemLogger.error(err);
        }
    } */



    /**
     * 最も得票数の多いユーザーのインデックスを返す
     * ※注意：最多得票数が並んでいるときは使わない！
     *
     * @returns
     */
    /* async getMostVotedUserIndex() {
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
    } */

    /**
     * 再投票で最多得票者が複数出た場合に最多得票者の中から処刑者をランダムで選ぶ
     * そのユーザーのインデックスを返す
     *
     * @param {*} userIndexes
     * @returns
     */
    /* async chooseExecutorIndex(userIndexes) {
        const index = Math.floor(Math.random() * userIndexes.length); // これは返さない
        return userIndexes[index];
    } */


    /**
     * 話し合いスタート時間を取得
     *
     * @returns
     * @memberof WordWolf
     */
    /* async getStartTime() {
        const query = {
            text: `SELECT start_time FROM ${this.setting} WHERE pl_id = $1;`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].start_time;
        } catch (err) {
            systemLogger.error(err);
        }
    } */

    /**
     * start_timeを現在の標準時刻で設定
     *
     * @memberof WordWolf
     */
    /* async updateStartTime() {
        const startTime = await commonFunction.getCurrentTime();
        const query = {
            text: `UPDATE ${this.setting} set start_time = $1 where pl_id = $2`,
            values: [startTime, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated start-time");
        } catch (err) {
            systemLogger.error(err);
        }
    } */


    /**
     * timerの値を取得(単位は分)
     *
     * @returns
     * @memberof WordWolf
     */
    /* async getTimer() {
        const query = {
            text: `SELECT timer FROM ${this.setting} WHERE pl_id = $1`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].timer;
        } catch (err) {
            systemLogger.error(err);
        }
    } */

    /**
     * タイマー設定を文字列で返す
     *
     * @returns
     * @memberof WordWolf
     */
    /* async getTimerString() {
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
    } */

    /**
     * タイマーの値を設定
     *
     * @param {*} interval
     * @memberof WordWolf
     */
    /* async updateTimer(interval) {
        const query = {
            text: `UPDATE ${this.setting} set timer = $1 where pl_id = $2`,
            values: [interval, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated timer");
        } catch (err) {
            systemLogger.error(err);
        }
    } */

    /**
     * endTimeを計算して入れる
     *
     * @returns
     * @memberof WordWolf
     */
    /* async updateEndTime() {
        const timer = await this.getTimer();
        const query = {
            text: `update ${this.setting} set end_time = start_time + $1 WHERE pl_id = $2`,
            values: [timer, this.plId]
        }
        try {
            await pg.query(query);
            console.log("Updated end-time ");
        } catch (err) {
            systemLogger.error(err);
        }
    } */

    /**
     * 時間の設定を一括挿入
     *
     * @memberof WordWolf
     */
    /* async updateTimeSetting() {
        await this.updateStartTime();
        await this.updateEndTime();
    } */

    /**
     * 残り時間が1分を切っているかどうかを返す
     *
     * @returns
     * @memberof WordWolf
     */
    /* async isRemainingTimeLessThan1minute() {
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
            systemLogger.error(err);
        }
    } */

    /**
     * 話し合い時間が終了しているかどうかを返す
     *
     * @returns
     * @memberof WordWolf
     */
    /* async isOverTime() {
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
            systemLogger.error(err);
            console.log(currentTime);
        }
    } */

    /**
     * 〇分××秒の形で残り時間を返す
     *
     * @returns
     * @memberof WordWolf
     */
    /* async getRemainingTime() {
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
            systemLogger.error(err);
        }
    } */

    /**
     * ユーザーがそれぞれ勝者かどうかを配列で返す
     *
     * @param {*} isExecutorWolf
     * @returns
     * @memberof WordWolf
     */
    async isWinnerArray(isExecutorWolf) {
        const userNumber = await this.getUserNumber();
        let res = [];
        for (let i = 0; i < userNumber; i++) {
            const isUserWolfSide = await this.isUserWolfSide(i);
            if (isExecutorWolf) {
                if (!isUserWolfSide) {
                    res[i] = true;
                } else {
                    res[i] = false;
                }
            } else {
                if (!isUserWolfSide) {
                    res[i] = false;
                } else {
                    res[i] = true;
                }
            }
        }
        return res;
    }

    /**
     * cron用の関数
     * 議論中のplidリストを送る
     *
     * @returns
     * @memberof WordWolf
     */
    /* async getDiscussingPlIds() {
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
            systemLogger.error(err);
        }
    } */

    /**
     * 設定変更中のものを設定
     *
     * @param {*} text
     * @memberof WordWolf
     */
    async updateChanging(text) {
        const query = {
            text: `update ${this.setting} set changing = $1 WHERE pl_id = $2`,
            values: [text, this.plId]
        }
        try {
            await pg.query(query);
            console.log("Updated changing");
        } catch (err) {
            systemLogger.error(err);
        }
    }

    async updateChangingNull() {
        const query = {
            text: `update ${this.setting} set changing = null WHERE pl_id = $1`,
            values: [this.plId]
        }
        try {
            await pg.query(query);
            console.log("Updated changing null");
        } catch (err) {
            systemLogger.error(err);
        }
    }

    /**
     * 変更中の設定を取得
     *
     * @returns
     * @memberof WordWolf
     */
    async getChanging() {
        const query = {
            text: `SELECT changing FROM ${this.setting} WHERE pl_id = $1`,
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].changing;
        } catch (err) {
            systemLogger.error(err);
        }
    }

    async isChanginNull() {
        const changing = await this.getChanging();
        let res = false;
        if (changing == null) {
            res = true;
        }
        return res;
    }
}

module.exports = WordWolf;