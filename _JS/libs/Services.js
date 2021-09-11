/**
 * User: Cloudy
 * Date: 22/03/2020
 * Time: 23:13
 */

const Main = require("../main");
const Messenger = require("./Messenger");
const Channels = require("./Channels");
const Roles = require("./Roles");

const Message = require("discord.js").Message;
const GuildMember = require("discord.js").GuildMember;

let services = [];

/**
 * Checks if object (Member or Message) is permitted to be executed in any of service's events.
 * @param obj
 * @param {Service} service
 */

exports.IsPermitted = (obj, service) => {
    if (Main.GetCurrentBot().client.user.id !== service.bot.client.user.id ||
        (obj !== null && typeof obj === undefined && typeof obj.client === undefined && obj.client.user.id !== Main.GetCurrentBot().client.user.id)) return false;
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
};

/**
 * Adds new service to the system.
 * @param {Service} obj
 */
exports.AddService = (obj) => {
    services.push(obj);
};

exports.OnStart = async (bot) => {
    services.forEach(service => {
        Main.SetCurrentBot(bot);
        // Main.SetCurrentBot(service.bot.client);
        if (!this.IsPermitted(null, service)) return;
        service.OnStart();
    });
};

exports.OnMessage = async (msg) => {
    if (msg.channel.type !== "text" || Main.IsBotId(msg.author.id)) return;
    Main.SetCurrentBot(msg.client);

    if (msg.content.indexOf(Main.Config.legacyPrefix[0]) === 0 || msg.content.indexOf(Main.Config.legacyPrefix[1]) === 0) { // Command
        let prefixLen = Main.Config.legacyPrefix[0].length;
        for (let i = 1; i < Main.Config.legacyPrefix.length; ++i) {
            if (msg.content.indexOf(Main.Config.legacyPrefix[i]) === 0) prefixLen = Main.Config.legacyPrefix[1].length;
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
        if (await this.OnCommand(msg, all[0].toLowerCase(), args)) {
            msg.delete();
            if (Main.Config.logCommands) Channels.GetChannel(Main.Config.channels.bot)
                                                 .send("**" + Messenger.GetName(msg.member) + "**: " + msg.content);
            return;
        }
    }
    services.forEach(service => {
        if (this.IsPermitted(msg, service)) service.OnMessage(msg);
    })
};

exports.OnCommand = async (msg, command, args) => {
    let del = false;
    services.forEach(service => {
        Main.SetCurrentBot(msg.client);
        // if (this.IsPermitted(msg, service)) del |= service.OnCommand(msg, command, args);
        if (this.IsPermitted(msg, service) && Object.keys(service.commands)
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
                service.currentCommand = command;
                service.commands[command]["callback"].call(service, msg, args);
                del = true;
            }
        }
    });

    return del;
};

exports.OnServerJoin = async (member) => {
    services.forEach(service => {
        Main.SetCurrentBot(member.client);
        if (this.IsPermitted(member, service)) {
            service.OnServerJoin(member);
        }
    });
};

exports.OnServerLeave = async (member) => {
    services.forEach(service => {
        Main.SetCurrentBot(member.client);
        if (this.IsPermitted(member, service)) {
            service.OnServerLeave(member);
        }
    });
};

exports.OnReactionAdd = async (react, user) => {
    Main.SetCurrentBot(react.client);
    let member = await Messenger.GetMemberById(user.id);

    let ok = true;
    services.forEach(service => {
        Main.SetCurrentBot(react.client);
        if (this.IsPermitted(member, service)) {
            ok &= service.OnReactionAdd(react, member);
        }
    });
    if (!ok) await react.users.remove(user);
};

exports.OnReactionRemove = async (react, user) => {
    Main.SetCurrentBot(react.client);
    let member = await Messenger.GetMemberById(user.id);

    services.forEach(service => {
        Main.SetCurrentBot(react.client);
        if (this.IsPermitted(member, service)) {
            service.OnReactionRemove(react, member);
        }
    });
};