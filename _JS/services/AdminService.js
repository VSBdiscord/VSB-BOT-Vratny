const Service = require("../service");
const Main = require("../main");
const Logger = require("../libs/Logger");
const Roles = require("../libs/Roles");
const Messenger = require("../libs/Messenger");
const Channels = require("../libs/Channels");
const Formatter = require("../libs/Formatter");
const SystemInformation = require("systeminformation");
const Discord = require("discord.js");

/**
 * @author DM
 */
class AdminService extends Service {
    constructor() {
        super();

        this.bot = Main.GetBot("porter");
        this.fetchChannels = [Main.Config.channels.bot];
        let data = {"requiredRole": Main.Config.roles.adminHelpRole};
        this.RegisterCommand("shutdown", this.onShutdown, data);
        this.RegisterCommand("message", this.onMessage, data);
        this.RegisterCommand("editmessage", this.onEditMessage, data);
        this.RegisterCommand("messagenorole", this.onMessageNoRole, data);
        this.RegisterCommand("version", this.onVersion);
        this.RegisterCommand("changename", this.onChangeName, data);
        this.RegisterCommand("clearchannel", this.onClearChannel, data);
        this.RegisterCommand("hwinfo", this.onHwInfo, data);

        this.RegisterCron("0 0 12 * * *", () => {
            this.sendNoRoleMessage(Main.Messages.noRoleDmMessage);
        });
    }

    onShutdown(msg, args) {
        msg.channel.send(Main.Messages.shuttingDown).then(msg => {
            process.exit();
        });
        return true;
    }

    onEditMessage(msg, args) {
        let id = args[0];
        let string = args.slice(1).join(" ");
        Messenger.GetMessageById(msg.channel.id, id).then(msg => {
            msg.edit(string).catch(() => {});
        });
    }

    onMessage(msg, args) {
        // let string = msg.content.substring(9);
        let string = args.join(" ");
        msg.channel.send(string);
        return true;
    }

    onMessageNoRole(msg, args) {
        let string = Main.Messages.noRoleDmMessage;
        if (msg.content !== "!messagenorole") {
            // string = msg.content.substring(15);
            string = args.join(" ");
        }
        this.sendNoRoleMessage(string);
        return true;
    }

    sendNoRoleMessage(message) {
        let members = Messenger.GetMembersWithoutRole();
        for (let i = 0; i < members.length; ++i) {
            if (members[i].user.dmChannel === null) {
                members[i].user.createDM().then(channel => {
                    channel.send(message).catch(() => {});
                });
            } else {
                members[i].user.dmChannel.send(message).catch(() => {});
            }
        }
        Channels.GetChannel(Main.Config.channels.bot)
                .send(Formatter.Format(Main.Messages.verificationDmMessage, [members.length.toString()]));
    }

    onVersion(msg, args) {
        msg.channel.send(Formatter.Format(Main.Messages.currentVersion, [Main.Package.version, Main.Package.lastupdate]))
           .catch(() => {});
    }

    async onChangeName(msg, args) {
        if (args.length === 1) {
            msg.member.setNickname(args[0]).catch(() => {});
        } else if (args.length >= 2) {
            let nick = args.slice(1).join(" ");
            let member = undefined;
            if (msg.mentions.members.size === 1) {
                member = msg.mentions.members.array()[0];
            } else {
                member = await Messenger.GetMemberById(args[0]);
            }
            if (member === undefined)
                return;
            member.setNickname(nick).catch(() => {});
        }
    }

    onClearChannel(msg, args) {
        let num = 100;
        if (args.length === 1) {
            num = parseInt(args[0]);
        }
        let cycles = Math.ceil(num / 100.) | 0;
        let timeBetweenCycles = 5000;
        Channels.GetChannel(Main.Config.channels.bot)
                .send("Deleting " + num + " messages in channel " + msg.channel.name + ". (Cycles = " + cycles + ", TimeBetweenCycles = " + timeBetweenCycles + "ms, Total = " + ((cycles - 1) * timeBetweenCycles) + "ms)");
        for (let i = 0; i < cycles; ++i) {
            let rem = (num >= 100) ? 100 : num;
            num -= rem;
            setTimeout(() => {
                msg.channel.bulkDelete(rem).then(messages => {
                    Logger.Info("Deleted " + rem + " messages from channel " + msg.channel.name + ".");
                }).catch(() => {
                    Logger.Error("Failed to delete " + rem + " messages from channel " + msg.channel.name + ".");
                });
            }, i * timeBetweenCycles);
        }
    }

    onHwInfo(msg, args) {
        let cpuInfo;
        let memInfo;

        SystemInformation.currentLoad().then(data => {
            cpuInfo = data;
            return SystemInformation.mem();
        }).then(data => {
            memInfo = data;

            let coresLoadString = "";
            for (let i = 0; i < cpuInfo.cpus.length; ++i) {
                coresLoadString += (coresLoadString.length > 0 ? "\n" : "") + " - **CPU" + i + "**: " + (Math.round(cpuInfo.cpus[i].load * 100) / 100).toFixed(2) + "%";
            }

            let embed = new Discord.MessageEmbed()
                .setColor("#0099ff")
                .setTitle("Hardware Info")
                .addFields(
                    {
                        name: "CPU",
                        value: "**Load**: " + (Math.round(cpuInfo.currentload * 100) / 100).toFixed(2) + "%\n" +
                            "**Cores**:\n" +
                            coresLoadString
                    },
                    {
                        name: "Memory",
                        value: "**Total**: " + (Math.round((memInfo.total / 1024 / 1024) * 100) / 100).toFixed(2) + " MB\n" +
                            "**Free**: " + (Math.round((memInfo.free / 1024 / 1024) * 100) / 100).toFixed(2) + " MB\n" +
                            "**Used**: " + (Math.round((memInfo.used / 1024 / 1024) * 100) / 100).toFixed(2) + " MB"
                    })
                .setTimestamp();
            this.Enforce();
            msg.channel.send(embed);
        });
    }

    // OnCommand(msg, command, args) {
    //     if (Roles.HasRole(msg.member, Main.Config.roles.adminHelpRole)) {
    //         if (command === "shutdown") {
    //             msg.channel.send(Main.Messages.shuttingDown).then(msg => {
    //                 process.exit();
    //             });
    //             return true;
    //         } else if (command === "message") {
    //             let string = msg.content.substring(9);
    //             msg.channel.send(string);
    //             return true;
    //         }
    //     }
    //
    //     return false;
    // }
}

module.exports = AdminService;