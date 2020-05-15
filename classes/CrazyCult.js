const { Client } = require('pg')
const pg = new Client(process.env.DATABASE_URL)

pg.connect().catch((error) => {
    console.log('Error connecting to database', error)
})

require('date-utils');

const ParticipantList = require("./ParticipantList");
const commonFunction = require("../template/functions/commonFunction");

class CrazyCult {

    /**
     *Creates an instance of WordWolf.
     * @param {*} plId
     */

    constructor(plId) {
        this.plId = plId;
        this.setting = "crazy_cult_setting";
        this.status = "crazy_cult_status";
        this.vote = "crazy_cult_vote";
        this.revote = "crazy_cult_revote"
    }

    

}