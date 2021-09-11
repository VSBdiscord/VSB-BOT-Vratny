/**
 * User: Bc. Milián Daniel
 * Date: 24/08/2021
 * Time: 19:09
 */
import {Service} from "../service";
import * as Main from "../main";

export class ChannelCleanService extends Service {
    constructor() {
        super();
        console.log("???");
        this.bot = Main.GetBot("porter");
        this.allowedChannels = [Main.Config.channels.giveaway];
        this.listenToBots = true;
    }

    async OnMessage(msg) {
        setTimeout(() => {
            msg.delete().catch(() => {});
        }, Main.Config.services.ChannelCleanService.deleteAfter * 1000);
    }
}