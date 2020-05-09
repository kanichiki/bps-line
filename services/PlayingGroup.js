const { Client } = require('pg')
const pg = new Client(process.env.DATABASE_URL)

pg.connect().catch((error) => {
    console.log('Error connecting to database', error)
})

module.exports = class PlayingGroup {
    /**
     * Creates an instance of PlayingGroup.
     * @param {*} plId 参加者リストのid
     * @param {*} gameId 開始するゲームのid
     */
    constructor(plId,gameId) {
        this.plId = plId;
        this.gameId = gameId;
        this.createPlayingGroup();
    }

    async createPlayingGroup(){
        const query = {
            text: 'INSERT INTO playing_group (pl_id,game_id) VALUES ($1,$2);',
            values: [this.plId, this.gameId]
        }
        try {
            await pg.query(query);
            console.log("Playing Group Inserted");
            return true;
        } catch (err) {
            console.log(err);
            console.log("新しいゲーム作れんかったよ");
            return false;
        }
    }
}