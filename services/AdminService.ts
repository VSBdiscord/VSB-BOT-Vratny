/**
 * User: Bc. Milián Daniel
 * Date: 07/08/2021
 * Time: 23:14
 */
import {Service} from "../service";
import * as Main from "../main";
import * as Messenger from "../libs/Messenger";
import * as Channels from "../libs/Channels";
import * as Formatter from "../libs/Formatter";
import * as Logger from "../libs/Logger";
import * as SystemInformation from "systeminformation";
import {Message, MessageEmbed, TextChannel} from "discord.js";

export class AdminService extends Service {
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

    onShutdown(msg: Message, args: string[]) {
        msg.channel.send(Main.Messages.shuttingDown).then(msg => {
            process.exit();
        });
        return true;
    }

    onEditMessage(msg: Message, args: string[]) {
        let id = args[0];
        let string = args.slice(1).join(" ");
        Messenger.GetMessageById(msg.channel.id, id).then((msg: Message) => {
            msg.edit(string).catch(() => {
            });
        });
    }

    onMessage(msg: Message, args: string[]) {
        // let string = msg.content.substring(9);
        let string = args.join(" ");
        msg.channel.send(string);
        return true;
    }

    onMessageNoRole(msg: Message, args: string[]) {
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
                    channel.send(message).catch(() => {
                    });
                });
            } else {
                members[i].user.dmChannel.send(message).catch(() => {
                });
            }
        }
        Channels.GetChannel(Main.Config.channels.bot)
            .send(Formatter.Format(Main.Messages.verificationDmMessage, [members.length.toString()]));
    }

    onVersion(msg: Message, args: string[]) {
        msg.channel.send(Formatter.Format(Main.Messages.currentVersion, [Main.Package.version, Main.Package.lastupdate]))
            .catch(() => {
            });
    }

    async onChangeName(msg: Message, args: string[]) {
        if (args.length === 1) {
            msg.member.setNickname(args[0]).catch(() => {
            });
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
            member.setNickname(nick).catch(() => {
            });
        }
    }

    onClearChannel(msg: Message, args: string[]) {
        let num = 100;
        if (args.length === 1) {
            num = parseInt(args[0]);
        }
        let cycles = Math.ceil(num / 100.) | 0;
        let timeBetweenCycles = 5000;
        Channels.GetChannel(Main.Config.channels.bot)
            .send("Deleting " + num + " messages in channel " + (msg.channel as TextChannel).name + ". (Cycles = " + cycles + ", TimeBetweenCycles = " + timeBetweenCycles + "ms, Total = " + ((cycles - 1) * timeBetweenCycles) + "ms)");
        for (let i = 0; i < cycles; ++i) {
            let rem = (num >= 100) ? 100 : num;
            num -= rem;
            setTimeout(() => {
                (msg.channel as TextChannel).bulkDelete(rem).then(messages => {
                    Logger.Info("Deleted " + rem + " messages from channel " + (msg.channel as TextChannel).name + ".");
                }).catch(() => {
                    Logger.Error("Failed to delete " + rem + " messages from channel " + (msg.channel as TextChannel).name + ".");
                });
            }, i * timeBetweenCycles);
        }
    }

    onHwInfo(msg: Message, args: string[]) {
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

            let embed = new MessageEmbed()
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
}
