/**
 * User: Cloudy
 * Date: 11/12/2020
 * Time: 20:50
 */

const Service = require("../service");
const Main = require("../main");
const fs = require("fs");
const Channels = require("../libs/Channels");

class CheckerLogService extends Service {
    constructor() {
        super();
        this.bot = Main.GetBot("porter");
    }

    async OnStart() {
        await super.OnStart();
        fs.access("./chkrerr.log", fs.constants.R_OK, (err) => {
            if (err)
                return;

            fs.readFile('./chkrerr.log', (err, data) => {
                if (err)
                    return;
                this.Enforce();
                Channels.GetChannel(Main.Config.channels.bot).send("**Error occurred on bot**: " + data.toString());
                fs.unlinkSync("./chkrerr.log");
            });
        });
    }
}

module.exports = CheckerLogService;