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
import * as Logger from "./libs/Logger";
import {ButtonInteractionWrap} from "./types/ButtonInteractionWrap";
import {SharedSlashCommandOptions, SlashCommandBuilder} from "@discordjs/builders";
import {CommandBehaviorCallback, SlashCommandWrap} from "./types/SlashCommandWrap";
import {ServiceGlobalData} from "./types/ServiceGlobalData";
import {ButtonBehaviorCallback} from "./types/ButtonBehaviorHandler";

export class Service {
    public static readonly globalData: ServiceGlobalData = new ServiceGlobalData();

    public bot: Bot;
    public forbiddenRoles: string[];
    public allowedChannels: string[];
    public fetchChannels: string[];
    public legacyCommands: { [name: string]: { [key: string]: any } };
    public commands: SlashCommandWrap[];
    public crons: Cron[];
    public listenToBots: boolean;
    public currentCommand: string;

    constructor() {
        this.bot = null;
        this.forbiddenRoles = [];
        this.allowedChannels = null;
        this.fetchChannels = null;
        this.legacyCommands = {};
        this.commands = [];
        this.crons = [];
        this.listenToBots = false;

        this.currentCommand = null;
    }

    /**
     * Creates handler for command.
     * @param cmd
     * @param callback
     * @param data
     * @deprecated Will be deleted in future version. Use RegisterSlashCommand instead.
     */
    protected RegisterLegacyCommand(cmd: string, callback: (cmd: Message, args: string[]) => Promise<void>, data: { [key: string]: any } = {}): void {
        let keys: string[] = [];
        if (data != null) {
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
        let infoTags: string = "";
        for (let key of keys) {
            infoTags += (infoTags.length > 0 ? "," : "") + key;
        }
        Logger.Info(`Legacy Command ${cmd} registered. [${infoTags}]`);

    }

    /**
     *
     * @param builder
     * @param callback
     * @param roles
     */
    protected RegisterSlashCommand(
        builder: SlashCommandBuilder | Omit<SharedSlashCommandOptions, "addSubcommand" | "addSubcommandGroup">,
        callback: CommandBehaviorCallback,
        roles: string[] | null = null
    ) {
        let instance: SlashCommandBuilder = builder as SlashCommandBuilder;
        if (roles !== []) {
            // instance.setDefaultPermission(false);
        }
        this.commands.push(new SlashCommandWrap(instance, callback, roles));
        Logger.Info(`Slash Command ${instance.name} registered.`);
    }

    /**
     * Creates new cron.
     * @param cronString
     * @param callback
     */
    protected RegisterCron(cronString: string, callback: () => void): Cron {
        let cron = new Cron(cronString, callback);
        this.crons.push(cron);
        Logger.Info(`Cron "${cronString}" registered.`);
        return cron;
    }

    /**
     * Defines custom message button behavior.
     * This behavior can be later used while attaching a new button onto message.
     *
     * @param uniqueKey Behavior's unique key
     * @param callback Callback for button click
     */
    protected DefineButtonBehavior(uniqueKey: string, callback: ButtonBehaviorCallback): void {
        Service.globalData.AddButtonBehavior(this, uniqueKey, callback);
        Logger.Info(`Button behavior ${uniqueKey} registered.`);
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

    public async OnButtonInteraction(buttonInteraction: ButtonInteractionWrap): Promise<void> {
    }
}

export class NonBotService extends Service {
    constructor() {
        super();
        this.bot = null;
    }

    protected RegisterLegacyCommand(cmd: string, callback: (cmd: Message, args: string[]) => void, data: { [p: string]: any } = {}) {
        return;
    }

    protected Enforce() {
        return;
    }

    async OnStart(): Promise<void> {
        return;
    }
}