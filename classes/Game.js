const { Client } = require('pg')
const pg = new Client(process.env.DATABASE_URL)

pg.connect().catch((error) => {
    console.log('Error connecting to database', error)
})

class Game{
    constructor() {

    }

    /**
     * ゲームの名前が存在するかどうかを返す
     *
     * @param {*} gameName
     * @returns
     */
    static async gameNameExists(gameName){
        const query = {
            text: 'SELECT id FROM game WHERE name = $1',
            values: [gameName]
        }
        try {
            const res = await pg.query(query);
            if(res.rowCount == 1){
                return true;
            }else if(res.rowCount > 1){
                throw "同じ名前のゲームが二個以上あるよ"
            }else{
                return false;
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * 与えられたゲーム名のゲームidを返す
     *
     * @param {*} gameName
     * @returns
     */
    static async getGameIdFromName(gameName){
        const query = {
            text: 'SELECT id FROM game WHERE name = $1',
            values: [gameName]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].id;
        } catch (err) {
            console.log(err);
            console.log("ゲームのidとれん");
        }
    }

    /**
     * 与えられたgameIdの名前を返す
     *
     * @param {*} gameId
     * @returns
     */
    static async getGameName(gameId) {
        const query = {
            text: 'SELECT name FROM game WHERE id = $1;',
            values: [gameId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].name;
        } catch (err) {
            console.log(err);
            console.log("ゲームの名前とってこれんやった")
        }
    }

    /**
     * 設定名を取得
     *
     * @static
     * @param {*} gameId
     * @returns
     * @memberof Game
     */
    static async getSettingNames(gameId){
        const query = {
            text: 'SELECT setting_names FROM game WHERE id = $1',
            values: [gameId]
        }
        try {
            const res = await pg.query(query);
            return res.rows[0].setting_names;
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = Game;