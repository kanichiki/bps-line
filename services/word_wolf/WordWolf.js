const { Client } = require('pg')
const pg = new Client(process.env.DATABASE_URL)

pg.connect().catch((error) => {
    console.log('Error connecting to database', error)
})

const ParticipantList = require("../ParticipantList");

module.exports = class WordWolf {


    /**
     *Creates an instance of WordWolf.
     * @param {*} plId
     */

    constructor(plId) {
        this.plId = plId;
    }

    /**
     * 与えられたgenreIdに一致したwordSetIdを配列で返す
     *
     * @param {*} genreId
     * @returns
     */
    async readWordSetIds(genreId) {
        const query = {
            text: 'SELECT id FROM word_set WHERE genre_id = $1;',
            values: [genreId]
        }
        try {
            const res = await pg.query(query);
            let wordSetIds = [];
            for(let i=0;i<res.rowCount;i++){
                wordSetIds.push(res.rows[i].id);
            }
            return wordSetIds;
        } catch (err) {
            console.log(err);
        }
    }


    /**
     * 与えられたジャンルのワードセットをランダムに選んで返す
     *
     * @param {*} genreId
     * @returns
     */
    async chooseWordSetId(genreId) {
        const wordSetIds = await this.readWordSetIds(genreId);
        console.log("wordSetIds :"+wordSetIds);
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
     * ワードウルフの設定データを挿入する
     * このとき、ウルフの番号はまだ決まっていない
     *
     * @param {*} genreId
     * @returns
     */

    async createWordWolfSetting(genreId) {
        const wordSetId = await this.chooseWordSetId(genreId);
        const isReverse = await this.chooseIsReverse();
        const query = {
            text: 'INSERT INTO word_wolf_setting (pl_id,word_set_id,is_reverse) VALUES ($1,$2,$3);',
            values: [this.plId, wordSetId, isReverse]
        }
        try {
            await pg.query(query);
            console.log("Word-Wolf Setting Inserted");
            return true;
        } catch (err) {
            console.log(err);
            console.log("新しいワードウルフの設定作れんかったよ");
            return false;
        }
    }


    /**
     * ワードセットのidを返す
     *
     * @returns
     */

    async readWordSetId() {
        const query = {
            text: 'SELECT word_set_id FROM word_wolf_setting WHERE pl_id = $1;',
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].word_set_id;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * ワードのジャンルidを返す
     *
     * @returns
     */
    async readGenreId() {
        const wordSetId = await this.readWordSetId();
        const query = {
            text: 'SELECT genre_id FROM word_set WHERE id = $1;',
            values: [wordSetId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].genre_id;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * isReverseの値を返す
     *
     * @returns
     */
    async readIsReverse() {
        const query = {
            text: 'SELECT is_reverse FROM word_wolf_setting WHERE pl_id = $1;',
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].is_reverse;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 市民用のワードを返す
     * is_reverseがfalseなら市民用はword1
     *
     * @returns
     */
    async readCitizenWord() {
        const wordSetId = await this.readWordSetId();
        const isReverse = await this.readIsReverse();
        
        let query = {}
        if (!isReverse) {
            query = {
                text: 'SELECT word1 FROM word_set WHERE id = $1;',
                values: [wordSetId]
            };
        } else {
            query = {
                text: 'SELECT word2 FROM word_set WHERE id = $1;',
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
            console.log(err);
        }
    }


    /**
     * ウルフ用のワードを返す
     * is_reverseがfalseならウルフ用はword2
     *
     * @returns
     */
    async readWolfWord() {
        const wordSetId = await this.readWordSetId();
        const isReverse = await this.readIsReverse();

        let query = {}
        if (!isReverse) {
            query = {
                text: 'SELECT word2 FROM word_set WHERE id = $1;',
                values: [wordSetId]
            };
        } else {
            query = {
                text: 'SELECT word1 FROM word_set WHERE id = $1;',
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
            console.log(err);
        }
    }

    /**
     * ウルフの人数を設定する
     *
     * @param {*} wolfNumber
     */
    async updateWolfNumber(wolfNumber) {
        const query = {
            text: 'UPDATE word_wolf_setting set wolf_number = $1 where pl_id = $2',
            values: [wolfNumber, this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated wolf-number");
        } catch (err) {
            console.log(err);
            console.log("ウルフの人数設定できんかった");
        }
    }

    /**
     * ウルフの人数を返す
     *
     * @returns
     */
    async readWolfNumber() {
        const query = {
            text: 'SELECT wolf_number FROM word_wolf_setting WHERE pl_id = $1;',
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].wolf_number;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * ParticipantListのメソッド転用
     * 参加者の人数を返す
     *
     * @returns
     */
    async countUserNumber(){
        const participantList = new ParticipantList();
        return participantList.countUserNumber(this.plId);
    }

    /**
     * 与えられたwolfNumberの数だけウルフのインデックスを重複のないように選んで返す
     * このインデックスは0から「参加者リストのuserの数-1」まで
     *
     * @param {*} wolfNumber
     * @returns
     */
    async chooseWolfIndexes(wolfNumber) {
        await this.updateWolfNumber(wolfNumber);
        const userNumber = await this.countUserNumber();

        try {
            let wolfIndexes = [];
            LOOP: for (let i = 0; i < wolfNumber; i++) {
                while (true) {
                    const num = Math.floor(Math.random() * userNumber);
                    let status = true;
                    for (const wolfIndex of wolfIndexes) {
                        if (wolfIndex == num) {
                            status = false;
                        }
                    }
                    if (status) {
                        wolfIndexes.push(num);
                        continue LOOP;
                    }
                }
            }
            console.log(wolfIndexes);
            return wolfIndexes;
        } catch (err) {
            console.log(err);
        }
    }


    /**
     * ウルフの番号を設定する
     * chooseWolfIndexes参照
     *
     * @param {*} wolfNumber
     */
    async updateWolfIndexes(wolfNumber) {
        const wolfIndexes = await this.chooseWolfIndexes(wolfNumber);

        const query = {
            text: 'UPDATE word_wolf_setting set wolf_indexes = $1 where pl_id = $2',
            values: [wolfIndexes, this.plId]
        };
        try {
            await pg.query(query).then(console.log("Updated wolf-indexes"));
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * ウルフの番号を取得する
     *
     * @returns
     */
    async readWolfIndexes() {
        const query = {
            text: 'SELECT wolf_indexes FROM word_wolf_setting WHERE pl_id = $1;',
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].wolf_indexes;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * ワードウルフの進捗状況データを挿入する
     * デフォルトではすべてfalse
     *
     * @returns
     */
    async createWordWolfStatus() {
        const query = {
            text: 'INSERT INTO word_wolf_status (pl_id) VALUES ($1);',
            values: [this.plId]
        }
        try {
            await pg.query(query);
            console.log("Word-Wolf Setting Status Inserted");
            return true;
        } catch (err) {
            console.log(err);
            console.log("新しいワードウルフの設定の進捗データ作れんかったよ");
            return false;
        }
    }

    /**
     * genreの選択状況をtrueにする
     *
     */
    async updateGenreStatusTrue() {
        const query = {
            text: 'UPDATE word_wolf_status set genre = true where pl_id = $1',
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated genre status");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * genreの選択状況を返す
     *
     * @returns
     */
    async readGenreStatus() {
        const query = {
            text: 'SELECT genre FROM word_wolf_status WHERE pl_id = $1;',
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].genre;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * wolf_numberの選択状況をtrueにする
     *
     */
    async updateWolfNumberStatusTrue() {
        const query = {
            text: 'UPDATE word_wolf_status set wolf_number = true where pl_id = $1',
            values: [this.plId]
        };
        try {
            await pg.query(query).then(console.log("Updated wolf-number status"));
        } catch (err) {
            console.log(err);
            console.log("ウルフの人数の設定状況更新できんかった");
        }
    }

    /**
     * wolf_numberの選択状況を返す
     *
     * @returns
     */
    async readWolfNumberStatus() {
        const query = {
            text: 'SELECT wolf_number FROM word_wolf_status WHERE pl_id = $1;',
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].wolf_number;
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
            text: 'UPDATE word_wolf_status set confirm = true where pl_id = $1',
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
     * 確認済みかどうかを返す
     *
     * @returns
     */
    async readConfirmStatus() {
        const query = {
            text: 'SELECT confirm FROM word_wolf_status WHERE pl_id = $1;',
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
     * プレイ終了ステータスをtrueにする
     *
     */
    async updateFinishedStatusTrue() {
        const query = {
            text: 'UPDATE word_wolf_status set finished = true where pl_id = $1',
            values: [this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated finished status");
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * プレイが終了しているどうかを返す
     *
     * @returns
     */
    async readFinishedStatus() {
        const query = {
            text: 'SELECT finished FROM word_wolf_status WHERE pl_id = $1;',
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].finished;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 結果の発表状況をtrueにする
     *
     */
    async updateResultStatusTrue() {
        const query = {
            text: 'UPDATE word_wolf_status set result = true where pl_id = $1',
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
     * 結果発表済みかどうかを返す
     *
     * @returns
     */
    async readResultStatus() {
        const query = {
            text: 'SELECT result FROM word_wolf_status WHERE pl_id = $1;',
            values: [this.plId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].result;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 与えられたgenreIdの名前を返す
     *
     * @param {*} genreId
     * @returns
     */
    async readGenreName(genreId) {
        const query = {
            text: 'SELECT name FROM word_genre WHERE id = $1;',
            values: [genreId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].name;
        } catch (err) {
            console.log(err);
        }
    }


    /**
     * ParticipantListクラスのメソッド転用
     * 参加者の表示名の配列を返す
     *
     * @returns
     */
    async readDisplayNames() {
        const participantList = new ParticipantList();
        return participantList.readDisplayNames(this.plId);
    }

    /**
     * すべてのジャンルのidと名前を連想配列にして返す
     *
     * @returns
     */
    async readAllGenreIdAndName() {
        const query = {
            text: 'SELECT id, name FROM word_genre'
        }
        try {
            let obj = {};
            const res = await pg.query(query);
            for(let i=0;i<res.rowCount;i++){
                obj[res.rows[i].id]=res.rows[i].name;
            }
            console.log(obj);
            return obj;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 与えられたジャンルの名前のジャンルidを返す
     *
     * @param {*} genreName
     * @returns
     */
    async readGenreIdFromName(genreName){
        const query = {
            text: 'SELECT id FROM word_genre WHERE name = $1',
            values: [genreName]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].id;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * ジャンルの名前が存在するかどうかを返す
     *
     * @param {*} genreName
     * @returns
     */
    async genreNameExists(genreName){
        const query = {
            text: 'SELECT id FROM word_genre WHERE name = $1',
            values: [genreName]
        }
        try {
            const res = await pg.query(query);
            if(res.rowCount == 1){
                return true;
            }else if(res.rowCount > 1){
                throw "同じ名前のジャンルが二個以上あるよ"
            }else{
                return false;
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * ParticipantListクラスの転用メソッド
     * 与えられたインデックスのuserIdを返す
     *
     * @param {*} index
     * @returns
     */
    async readUserId(index){
        const participantList = new ParticipantList();
        return participantList.readUserId(this.plId,index);
    }


    /**
     * 投票データを挿入する
     * numbersは誰が何票入ってるかの配列
     * statusは誰が投票済みかの配列
     *
     * @returns
     */
    async createWordWolfVote(){
        const userNumber = await this.countUserNumber();
        let votes = [];
        let status = [];
        for(let i=0;i<userNumber;i++){
            votes.push(0);
            status.push(false);
        }

        const query = {
            text: 'INSERT INTO word_wolf_vote (pl_id,numbers,status) VALUES ($1,$2,$3);',
            values: [this.plId, votes, status]
        }
        try {
            await pg.query(query);
            console.log("Word-Wolf Vote Inserted");
            return true;
        } catch (err) {
            console.log(err);
            console.log("新しいワードウルフの投票データ作れんかったよ");
            return false;
        }
    }

    
    /**
     * 得票数の配列を返す
     *
     * @returns
     */
    async readVoteNumbers(){
        const query = {
            text: 'SELECT numbers FROM word_wolf_vote WHERE pl_id = $1',
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
    async readVoteStatus(){
        const query = {
            text: 'SELECT status FROM word_wolf_vote WHERE pl_id = $1',
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
    async readVoteState(userIndex){
        const status = await this.readVoteStatus();
        return status[userIndex];
    }

    /**
     * 与えられたuserIndexのユーザーの得票数を1増やす
     *
     * @param {*} userIndex
     */
    async updateVoteNumber(userIndex) {
        let numbers = await this.readVoteNumbers();
        numbers[userIndex] += 1; // 得票数1追加
        const query = {
            text: 'UPDATE word_wolf_vote set numbers = $1 where pl_id = $2',
            values: [numbers,this.plId]
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
    async updateVoteStatus(userIndex) {
        let status = await this.readVoteStatus();
        if(!status[userIndex]){
            status[userIndex]=true;
        }else{
            throw "既に投票済み";
        }
        const query = {
            text: 'UPDATE word_wolf_vote set status = $1 where pl_id = $2',
            values: [status,this.plId]
        };
        try {
            await pg.query(query);
            console.log("Updated vote status");
        } catch (err) {
            console.log(err);
        }
    }

    
}