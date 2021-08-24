/**
 * User: Bc. Milián Daniel
 * Date: 24/08/2021
 * Time: 19:10
 */
import {Service} from "../service";
import * as Main from "../main";
import * as Channels from "../libs/Channels";
import * as fs from "fs";

export class CheckerLogService extends Service {
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