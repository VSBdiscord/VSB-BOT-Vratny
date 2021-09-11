/**
 * User: Cloudy
 * Date: 22/03/2020
 * Time: 23:10
 */

const Channels = require("./libs/Channels");
const Cron = require("./cron");
const Main = require("./main");

class Service {
    constructor() {
        this.bot = null;
        this.forbiddenRoles = [];
        this.allowedChannels = null;
        this.fetchChannels = null;
        this.commands = {};
        this.crons = [];
        this.listenToBots = false;

        this.currentCommand = null;
    }

    /**
     * Creates handler for command.
     * @param {string} cmd
     * @param {function} callback
     * @param {Object} [data=undefined]
     */
    RegisterCommand(cmd, callback, data) {
        let keys = [];
        if (data !== undefined) {
            keys = Object.keys(data);
        }
        data = {
            "requiredRole": keys.indexOf("requiredRole") !== -1 ? data["requiredRole"] : null,
            "allowedChannels": keys.indexOf("allowedChannels") !== -1 ? data["allowedChannels"] : null,
            "forbiddenRoles": keys.indexOf("forbiddenRoles") !== -1 ? data["forbiddenRoles"] : []
        };
        this.legacyCommands[cmd.toLowerCase()] = {
            "callback": callback,
            "requiredRole": data["requiredRole"],
            "allowedChannels": data["allowedChannels"],
            "forbiddenRoles": data["forbiddenRoles"]
        };
    }

    /**
     * Creates new cron.
     * @param {string} cronString
     * @param {function} callback
     * @return {Cron}
     */
    RegisterCron(cronString, callback) {
        let cron = new Cron(cronString, callback);
        this.crons.push(cron);
        return cron;
    }

    GetCommand() {
        return this.currentCommand;
    }

    Enforce() {
        Main.SetCurrentBot(this.bot.client);
    }

    async OnStart() {
        if (this.fetchChannels === null) {
            if (this.allowedChannels !== null) {
                this.fetchChannels = [...this.allowedChannels];
            } else return;
        }
        for (let i = 0; i < this.fetchChannels.length; ++i) {
            await Channels.FetchChannel(this.fetchChannels[i]);
        }
    }

    /**
     * Message event
     * @param {Message} msg
     * @constructor
     */
    async OnMessage(msg) {
    }

    // /**
    //  * Command event
    //  * @param {Message} msg
    //  * @param {string} command
    //  * @param {string[]} args
    //  * @return boolean
    //  */
    // OnCommand(msg, command, args) {
    //     return false;
    // }

    /**
     * User connects the server.
     * @param {GuildMember} member
     * @constructor
     */
    async OnServerJoin(member) {
    }

    /**
     * User leaves the server.
     * @param {GuildMember} member
     * @constructor
     */
    async OnServerLeave(member) {

    }

    /**
     * When member adds reaction on message
     * @param {MessageReaction} reaction
     * @param {GuildMember} member
     * @constructor
     */
    async OnReactionAdd(reaction, member) {
        return true;
    }

    /**
     * When member removes reaction on message
     * @param {MessageReaction} reaction
     * @param {GuildMember} member
     * @constructor
     */
    async OnReactionRemove(reaction, member) {
    }
}

module.exports = Service;