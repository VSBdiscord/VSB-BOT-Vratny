/**
 * User: Bc. Milián Daniel
 * Date: 27/07/2021
 * Time: 18:19
 */

import * as Main from "./main";
import {Bot} from "./bot";
import {GuildMember, Message, MessageReaction} from "discord.js";
import {Cron} from "./cron";
import * as Channels from "./libs/Channels";

export class Service {
    bot: Bot;
    forbiddenRoles: string[];
    allowedChannels: string[];
    fetchChannels: string[];
    commands: { [name: string]: { [key: string]: any } };
    crons: Cron[];
    listenToBots: boolean;
    currentCommand: string;

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
     * @param cmd
     * @param callback
     * @param data
     */
    protected RegisterCommand(cmd: string, callback: (cmd: Message, args: string[]) => void, data: { [key: string]: any } = {}): void {
        let keys: string[] = [];
        if (data != null)
            keys = Object.keys(data);
        data = {
            "requiredRole": keys.indexOf("requiredRole") !== -1 ? data["requiredRole"] : null,
            "allowedChannels": keys.indexOf("allowedChannels") !== -1 ? data["allowedChannels"] : null,
            "forbiddenRoles": keys.indexOf("forbiddenRoles") !== -1 ? data["forbiddenRoles"] : []
        };
        this.commands[cmd.toLowerCase()] = {
            "callback": callback,
            "requiredRole": data["requiredRole"],
            "allowedChannels": data["allowedChannels"],
            "forbiddenRoles": data["forbiddenRoles"]
        };
    }

    /**
     * Creates new cron.
     * @param cronString
     * @param callback
     */
    protected RegisterCron(cronString: string, callback: () => void): Cron {
        let cron = new Cron(cronString, callback);
        this.crons.push(cron);
        return cron;
    }

    protected Enforce(): void {
        Main.SetCurrentBot(this.bot.client);
    }

    /**
     * Start event
     */
    public async OnStart() {
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
     * @param msg
     */
    public async OnMessage(msg: Message) {
    }

    /**
     * User connects the server.
     * @param member
     */
    public async OnServerJoin(member: GuildMember) {
    }

    /**
     * User leaves the server.
     * @param member
     */
    public async OnServerLeave(member: GuildMember) {

    }

    /**
     * When member adds reaction on message
     * @param reaction
     * @param member
     */
    public async OnReactionAdd(reaction: MessageReaction, member: GuildMember): Promise<boolean> {
        return true;
    }

    /**
     * When member removes reaction on message
     * @param reaction
     * @param member
     */
    public async OnReactionRemove(reaction: MessageReaction, member: GuildMember) {
    }
}