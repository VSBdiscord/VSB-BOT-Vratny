/**
 * User: Cloudy
 * Date: 26/03/2020
 * Time: 18:44
 */

const Service = require("../service");
const Main = require("../main");

/**
 * @author DM
 */
class ChannelCleanService extends Service {
    constructor() {
        super();
        this.bot = Main.GetBot("porter");
        this.allowedChannels = [Main.Config.channels.giveaway];
        this.listenToBots = true;
    }

    OnMessage(msg) {
        setTimeout(() => {
            msg.delete().catch(() => {});
        }, Main.Config.services.ChannelCleanService.deleteAfter * 1000);
    }
}

module.exports = ChannelCleanService;