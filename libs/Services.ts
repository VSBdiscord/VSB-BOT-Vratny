/**
 * User: Bc. Milián Daniel
 * Date: 07/08/2021
 * Time: 20:36
 */

import * as Main from "../main";
import * as Messenger from "./Messenger";
import * as Channels from "./Channels";
import * as Roles from "./Roles";

import {Message, GuildMember, Base, ReactionEmoji, User, MessageReaction} from "discord.js";
import {Service} from "../service";
import {Bot} from "../bot";

let services: Service[] = [];

/**
 *
 * @param obj
 * @param service
 * @constructor
 */
export function IsPermitted(obj: object, service: Service): boolean {
    if (Main.GetCurrentBot().client.user.id != service.bot.client.user.id ||
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
    services.push(obj);
}

export async function OnStart(bot: Bot) {
    services.forEach(service => {
        Main.SetCurrentBot(bot.client);
        // Main.SetCurrentBot(service.bot.client);
        if (!this.IsPermitted(null, service)) return;
        service.OnStart();
    });
}

export async function OnMessage(msg: Message) {
    if (msg.channel.type !== "text" || Main.IsBotId(msg.author.id)) return;
    Main.SetCurrentBot(msg.client);

    if (msg.content.indexOf(Main.Config.prefix[0]) === 0 || msg.content.indexOf(Main.Config.prefix[1]) === 0) { // Command
        let prefixLen = Main.Config.prefix[0].length;
        for (let i = 1; i < Main.Config.prefix.length; ++i) {
            if (msg.content.indexOf(Main.Config.prefix[i]) === 0) prefixLen = Main.Config.prefix[1].length;
        }
        let content = msg.content.substring(prefixLen);
        let inString = false;
        for (let i = 0; i < content.length; ++i) {
            let char = content.charAt(i);
            if (char === " " && inString) {
                content = content.substring(0, i) + "$_$" + content.substring(i + 1);
                i += 2;
            } else if (char === "\"") {
                inString = !inString;
                content = content.substring(0, i) + content.substring(i + 1);
                i--;
            }
        }
        let all = content.split(" ");
        for (let i = 0; i < all.length; ++i) {
            all[i] = all[i].split("$_$").join(" ");
        }
        let args = [...all];
        args = args.filter(el => el.length !== 0);

        args.splice(0, 1);
        if (await OnCommand(msg, all[0].toLowerCase(), args)) {
            await msg.delete();
            if (Main.Config.logCommands) await Channels.GetChannel(Main.Config.channels.bot)
                .send("**" + Messenger.GetName(msg.member) + "**: " + msg.content);
            return;
        }
    }
    for (let service of services) {
        if (this.IsPermitted(msg, service)) await service.OnMessage(msg);
    }
}

export async function OnCommand(msg: Message, command: string, args: string[]): Promise<boolean> {
    let del: boolean = false;
    for (let service of services) {
        Main.SetCurrentBot(msg.client);
        // if (this.IsPermitted(msg, service)) del |= service.OnCommand(msg, command, args);
        if (IsPermitted(msg, service) && Object.keys(service.commands)
                .indexOf(command) !== -1 &&
            (service.commands[command]["allowedChannels"] === null || service.commands[command]["allowedChannels"].indexOf(msg.channel) !== -1) &&
            (service.commands[command]["requiredRole"] == null || Roles.HasRole(msg.member, service.commands[command]["requiredRole"]))) {
            let hasForbiddenRole = false;
            for (let i = 0; i < service.commands[command]["forbiddenRoles"].length; ++i) {
                if (Roles.HasRole(msg.member, service.commands[command]["forbiddenRoles"][i])) {
                    hasForbiddenRole = true;
                    break;
                }
            }
            if (!hasForbiddenRole) {
                // service.currentCommand = command;
                service.currentCommand = command;
                service.commands[command]["callback"].call(service, msg, args);
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
            await service.OnServerJoin(member);
        }
    }
}

export async function OnServerLeave(member: GuildMember) {
    for (let service of services) {
        Main.SetCurrentBot(member.client);
        if (IsPermitted(member, service)) {
            await service.OnServerLeave(member);
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
            ok &&= await service.OnReactionAdd(react, member);
        }
    }
    if (!ok) await react.users.remove(user);
}

export async function OnReactionRemove(react: MessageReaction, user: User) {
    Main.SetCurrentBot(react.client);
    let member = await Messenger.GetMemberById(user.id);

    for (let service of services) {
        Main.SetCurrentBot(react.client);
        if (this.IsPermitted(member, service)) {
            await service.OnReactionRemove(react, member);
        }
    }
}