const { Client } = require('pg')
const pg = new Client(process.env.DATABASE_URL)

pg.connect().catch((error) => {
    console.log('Error connecting to database', error)
})

module.exports = class PlayingGame{
    

    /**
     *Creates an instance of PlayingGame.
     * @param {*} plId 参加者リストのid
     */

    constructor(plId) {
        this.plId = plId;
    }

    /**
     * 指定されたplId,gameIdのPlayingGameデータを挿入
     *
     * @param {*} gameId
     * @returns
     */
    async createPlayingGame(gameId){
        const query = {
            text: 'INSERT INTO playing_game (pl_id,game_id) VALUES ($1,$2);',
            values: [this.plId, gameId]
        }
        try {
            await pg.query(query);
            console.log("Playing Game Inserted");
            return true;
        } catch (err) {
            console.log(err);
            console.log("新しい進行中ゲーム作れんかったよ");
            return false;
        }
    }

    /**
     * 指定されたplIdのgameIdを返す
     * なかったら-1を返す
     *
     * @returns
     */
    async readGameId(){
        const query = {
            text: 'SELECT game_id FROM playing_game WHERE pl_id = $1;',
            values: [this.plId]
        }
        try{
            const res = await pg.query(query);
            return res.rows[0].game_id;
        }catch(err){
            console.log(err);
            return -1;
        }
    }

    /**
     * WordWolfクラスのメソッド転用
     * ワードウルフの設定状況のデータを挿入
     *
     */
    async createWordWolfStatus(){
        const WordWolf = require("./word_wolf/WordWolf");
        const wordWolf = new WordWolf(this.plId);
        wordWolf.createWordWolfStatus();
    }

}