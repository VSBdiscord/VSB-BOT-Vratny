/**
 * User: Bc. Milián Daniel
 * Date: 07/08/2021
 * Time: 20:36
 */

import * as Main from "../main";
import * as Messenger from "./Messenger";
import * as Channels from "./Channels";
import * as Roles from "./Roles";
import * as Logger from "./Logger";

import {
    Message,
    GuildMember,
    Base,
    ReactionEmoji,
    User,
    MessageReaction,
    Interaction,
    MessageInteraction, ButtonInteraction, MessageButton, CommandInteraction
} from "discord.js";
import {Service} from "../service";
import {Bot} from "../bot";
import {ButtonInteractionWrap} from "../types/ButtonInteractionWrap";
import {StringUtils} from "./StringUtils";
import {ButtonBehaviorHandler} from "../types/ButtonBehaviorHandler";
import {Error} from "./Logger";
import {BotLogger} from "./BotLogger";
import {mem} from "systeminformation";

let services: Service[] = [];

async function executeWithErrorHandling(func: Function, service: Service, ...args: any[]): Promise<any> {
    return new Promise((resolve) => {
        func.call(service, ...args).then(data => {
            resolve(data);
        }, err => {
            BotLogger.Error(err);
            resolve(null);
        });
    });
}

/**
 *
 * @param obj
 * @param service
 * @constructor
 */
export function IsPermitted(obj: object, service: Service): boolean {
    if (service.bot === null || service.bot.client === null || Main.GetCurrentBot().client.user.id !== service.bot.client.user.id ||
        (obj != null && obj instanceof Base && typeof obj.client === undefined && obj.client.user.id !== Main.GetCurrentBot().client.user.id))
        return false;
    if (obj instanceof Message) {
        if ((Main.Config.debug && Main.Config.testers.indexOf(obj.author.id) === -1) || (obj.author.bot && !service.listenToBots) || (service.allowedChannels !== null && service.allowedChannels.indexOf(obj.channel.id) === -1))
            return false;
        for (let i = 0; i < service.forbiddenRoles.length; ++i) {
            if (Roles.HasRole(obj.member, service.forbiddenRoles[i])) return false;
        }
        return true;
    } else if (obj instanceof GuildMember) {
        return (!Main.Config.debug || Main.Config.testers.indexOf(obj.id) > -1) && !(obj.user.bot && !service.listenToBots);
    } else if (obj === null) {
        return true;
    }
    return false;
}

/**
 *
 * @param obj
 * @constructor
 */
export function AddService(obj: Service) {
    Logger.Info(`Service ${obj.constructor.name} has been registered with bot ${obj.bot !== null ? obj.bot.name : "null"}.`);
    services.push(obj);
}

export function GetService<T extends Service>(serviceType: new() => T): T | null {
    for (let service of services) {
        if (service.constructor.name !== serviceType.name) {
            continue;
        }
        return service as T;
    }
    return null;
}

export function GetBotServices(bot: Bot): Service[] {
    let array: Service[] = [];
    for (let service of services) {
        if (service.bot === null || service.bot !== bot) {
            continue;
        }
        array.push(service);
    }
    return array;
}

export async function OnStart(bot: Bot) {
    services.forEach(service => {
        if (bot !== null) {
            Main.SetCurrentBot(bot.client);
            // Main.SetCurrentBot(service.bot.client);
            if (!IsPermitted(null, service)) return;
            Logger.Info("Service " + service.constructor.name + " has been started.");
            executeWithErrorHandling(service.OnStart, service).finally();
        } else if (service.bot === null) { // Start service with no assigned bot.
            executeWithErrorHandling(service.OnStart, service).finally();
        }
    });
}

export async function OnMessage(msg: Message) {
    if (msg.channel.type !== "GUILD_TEXT" || Main.IsBotId(msg.author.id)) return;
    Main.SetCurrentBot(msg.client);

    if (msg.content.indexOf(Main.Config.legacyPrefix[0]) === 0 || msg.content.indexOf(Main.Config.legacyPrefix[1]) === 0) { // Command
        let prefixLen = Main.Config.legacyPrefix[0].length;
        for (let i = 1; i < Main.Config.legacyPrefix.length; ++i) {
            if (msg.content.indexOf(Main.Config.legacyPrefix[i]) === 0) prefixLen = Main.Config.legacyPrefix[1].length;
        }
        let content = msg.content.substring(prefixLen);
        // let inString = false;
        // for (let i = 0; i < content.length; ++i) {
        //     let char = content.charAt(i);
        //     if (char === " " && inString) {
        //         content = content.substring(0, i) + "$_$" + content.substring(i + 1);
        //         i += 2;
        //     } else if (char === "\"") {
        //         inString = !inString;
        //         content = content.substring(0, i) + content.substring(i + 1);
        //         i--;
        //     }
        // }
        // let all = content.split(" ");
        // for (let i = 0; i < all.length; ++i) {
        //     all[i] = all[i].split("$_$").join(" ");
        // }
        let all: string[] = StringUtils.Split(content, "\\s");
        let args = [...all];
        args = args.filter(el => el.length !== 0);

        args.splice(0, 1);
        if (await OnCommand(msg, all[0].toLowerCase(), args)) {
            await msg.delete();
            if (Main.Config.logCommands) Channels.GetChannel(Main.Config.channels.bot)
                .send("**" + Messenger.GetDetailedName(msg.member) + "**: " + msg.content).finally();
            return;
        }
    }
    for (let service of services) {
        if (IsPermitted(msg, service)) await service.OnMessage(msg);
    }
}

export async function OnCommand(msg: Message, command: string, args: string[]): Promise<boolean> {
    let del: boolean = false;
    for (let service of services) {
        Main.SetCurrentBot(msg.client);
        // if (IsPermitted(msg, service)) del |= service.OnCommand(msg, command, args);
        if (
            IsPermitted(msg, service) &&
            Object.keys(service.legacyCommands).indexOf(command) !== -1 &&
            (service.legacyCommands[command]["allowedChannels"] === null || service.legacyCommands[command]["allowedChannels"].indexOf(msg.channel) !== -1) &&
            (service.legacyCommands[command]["requiredRole"] === null || Roles.HasRole(msg.member, service.legacyCommands[command]["requiredRole"]))
        ) {
            let hasForbiddenRole = false;
            for (let i = 0; i < service.legacyCommands[command]["forbiddenRoles"].length; ++i) {
                if (Roles.HasRole(msg.member, service.legacyCommands[command]["forbiddenRoles"][i])) {
                    hasForbiddenRole = true;
                    break;
                }
            }
            if (!hasForbiddenRole) {
                // service.currentCommand = command;
                service.currentCommand = command;
                executeWithErrorHandling(service.legacyCommands[command]["callback"], service, msg, args).finally();
                del = true;
            }
        }
    }

    return del;
}

export async function OnServerJoin(member: GuildMember) {
    for (let service of services) {
        Main.SetCurrentBot(member.client);
        if (IsPermitted(member, service)) {
            executeWithErrorHandling(service.OnServerJoin, service, member).finally();
        }
    }
}

export async function OnServerLeave(member: GuildMember) {
    for (let service of services) {
        Main.SetCurrentBot(member.client);
        if (IsPermitted(member, service)) {
            executeWithErrorHandling(service.OnServerLeave, service, member).finally();
        }
    }
}

export async function OnReactionAdd(react: MessageReaction, user: User) {
    Main.SetCurrentBot(react.client);
    let member: GuildMember = await Messenger.GetMemberById(user.id);

    let ok: boolean = true;
    for (let service of services) {
        Main.SetCurrentBot(react.client);
        if (IsPermitted(member, service)) {
            let result: any = await executeWithErrorHandling(service.OnReactionAdd, service, react, member);
            ok &&= result === null ? true : result;
        }
    }
    if (!ok) await react.users.remove(user);
}

export async function OnReactionRemove(react: MessageReaction, user: User) {
    Main.SetCurrentBot(react.client);
    let member = await Messenger.GetMemberById(user.id);

    for (let service of services) {
        Main.SetCurrentBot(react.client);
        if (IsPermitted(member, service)) {
            executeWithErrorHandling(service.OnReactionRemove, service, react, member).finally();
        }
    }
}

export async function OnButtonInteraction(interaction: Interaction) {
    Main.SetCurrentBot(interaction.client);

    let buttonInteraction: ButtonInteraction = interaction as ButtonInteraction;
    let wrap: ButtonInteractionWrap = new ButtonInteractionWrap(
        interaction.member as GuildMember,
        buttonInteraction.component as MessageButton,
        buttonInteraction.message as Message,
        buttonInteraction
    );

    if (Main.Config.logCommands) {
        Channels.GetChannel(Main.Config.channels.bot)
            .send("**" + Messenger.GetDetailedName(interaction.member as GuildMember) + "**: BUTTON `" + buttonInteraction.customId + "`").finally();
    }

    // Handle button with defined handlers
    let handlerId: string = buttonInteraction.customId;
    if (handlerId.indexOf("[") > -1 && handlerId.indexOf("]") > -1) {
        handlerId = handlerId.substring(handlerId.indexOf("[") + 1, handlerId.indexOf("]"));
    }
    let handler: ButtonBehaviorHandler = Service.globalData.GetButtonBehavior(handlerId);
    if (handler !== undefined) {
        // TODO: Save args to the ID.
        let argsString: string = "";
        if (buttonInteraction.customId.indexOf("{") > -1 && buttonInteraction.customId.indexOf("}") > -1) {
            argsString = buttonInteraction.customId.substring(buttonInteraction.customId.indexOf("{") + 1, buttonInteraction.customId.indexOf("}"));
        }
        let args: string[] = StringUtils.Split(argsString, "\\s");

        executeWithErrorHandling(handler.callback, handler.service, wrap, args).finally();
        // await buttonInteraction.deferUpdate();
    }

    // Handle button with services
    for (let service of services) {
        // Probably expand the interaction system and add button handlers directly to the services.
        // This gives all services the permission to handle this interaction which isn't really good solution but it's temporary.
        if (IsPermitted(interaction.member as GuildMember, service)) {
            executeWithErrorHandling(service.OnButtonInteraction, service, wrap).finally();
        }
    }
}

export async function OnCommandInteraction(interaction: Interaction): Promise<void> {
    Main.SetCurrentBot(interaction.client);

    let commandInteraction: CommandInteraction = interaction as CommandInteraction;

    if (Main.Config.logCommands) {
        let json: string = "";
        for (let option of commandInteraction.options.data) {
            json += (json.length > 0 ? ", " : "") + option.name + ": \"" + option.value.toString() + "\"";
        }
        Channels.GetChannel(Main.Config.channels.bot)
            .send("**" + Messenger.GetDetailedName(interaction.member as GuildMember) + "**: /" + commandInteraction.commandName + ` \`{ ${json} }\``).finally();
    }

    for (let service of services) {
        if (IsPermitted(interaction.member as GuildMember, service)) {
            for (let entry of service.commands) {
                if (entry.builder.name !== commandInteraction.commandName) {
                    continue;
                }
                executeWithErrorHandling(entry.callback, service, commandInteraction).finally();
            }
        }
    }
}