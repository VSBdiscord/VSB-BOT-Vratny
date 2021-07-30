let Service = require("../service");
const Main = require("../main");
const Roles = require("../libs/Roles");
const Channels = require("../libs/Channels");
const Formatter = require("../libs/Formatter");
const Messenger = require("../libs/Messenger");
const Mail = require("../libs/Mail");
const Files = require("../libs/Files");
// const Command = require("../decorators/Command");

// TODO: Rewritte with decorators, mainly OnMessage method, add permitted rooms where actuall service can work.
// TODO: Verification by email and generated hash.
/**
 * @author DM
 */
class VerificationService extends Service {
    constructor() {
        super();
        this.bot = Main.GetBot("porter");
        // this.forbiddenRoles = [Main.Config.roles.hostRole, Main.Config.roles.studentRole, ...Main.Config.roles.otherRoles];
        this.allowedChannels = [Main.Config.channels.welcome];
        let data = {"forbiddenRoles": [Main.Config.roles.hostRole, Main.Config.roles.studentRole, ...Main.Config.roles.otherRoles]};
        this.RegisterCommand("student", this.onStudent, data);
        this.RegisterCommand("erasmus", this.onStudent, data);
        this.RegisterCommand("teacher", this.onTeacher, data);
        this.RegisterCommand("doctorate", this.onTeacher, data);
        this.RegisterCommand("help", this.onHelp, data);
        this.RegisterCommand("verify", this.onVerify, data);
        this.RegisterCommand("host", this.onHost, data);
        this.RegisterCommand("absolvent", this.onAbsolvent, data);
    }

    generateVerificationString() {
        let len = 8;
        let vocabulary = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
        let string = "";
        for (let i = 0; i < len; ++i) {
            string += vocabulary.substr(Math.random() * vocabulary.length, 1);
        }
        return string;
    }

    onStudent(msg, args) {
        if (!this.checkArgument(msg, args)) return true;
        let name = args[0].toLowerCase();
        let isErasmus = this.GetCommand() !== "student";

        if (this.checkName(name)) {
            Main.Database.Select(Main.Config.database.queries.select.userById, [msg.member.id]).then(rows => {
                if (rows.length > 0) {
                    if (rows[0].activity === 0) {
                        Main.Database.Run(Main.Config.database.queries.update.userActivityById, [1, msg.member.id]);
                        Roles.AddRole(msg.member, Main.Config.roles.studentRole);
                    } else {
                        if (name !== rows[0].login) {
                            Main.Database.Run(Main.Config.database.queries.update.userLoginById, [name, msg.member.id]);
                            this.sendVerification(name, rows[0].verification, isErasmus);
                            msg.reply(Main.Messages.userLoginChanged[isErasmus ? 1 : 0]).then(msg => {
                                Messenger.DeleteAfter(msg, Main.Config.messenger.deleteAfter);
                            });
                        } else {
                            msg.reply(Main.Messages.userActive[isErasmus ? 1 : 0]).then(msg => {
                                Messenger.DeleteAfter(msg, Main.Config.messenger.deleteAfter);
                            });
                        }
                    }
                } else {
                    let code = this.generateVerificationString();
                    Main.Database.Run(Main.Config.database.queries.insert.user, [msg.member.id, name, 2, isErasmus ? 1 : 0, code]);
                    msg.reply(Main.Messages.studentVerify[isErasmus ? 1 : 0]).then(msg => {
                        Messenger.DeleteAfter(msg, Main.Config.messenger.deleteAfter);
                    });
                    this.sendVerification(name, code, isErasmus);
                    // Roles.AddRole(msg.member, this.GetCommand() === "student" ? Main.Config.roles.studentRole : Main.Config.roles.erasmusRole);
                }
            });
        } else {
            msg.reply(Main.Messages.wrongLogin[isErasmus ? 1 : 0]).then(msg => {
                Messenger.DeleteAfter(msg, Main.Config.messenger.deleteAfter);
            });
        }

        return true;
    }

    sendVerification(name, code, isErasmus) {
        let mailHtml = Files.ReadFile(Main.Config.assets.verificationMail);
        Mail.Send(name + "@vsb.cz", Main.Messages.verificationMailSubject[isErasmus ? 1 : 0], Formatter.Format2(mailHtml, ["{{{", "}}}"],
            [Main.Messages.verificationMail.title[isErasmus ? 1 : 0],
                Formatter.Format(Main.Messages.verificationMail.text[isErasmus ? 1 : 0], [code]),
                Formatter.Format(Main.Messages.verificationMail.button, [code])]));
    }

    onTeacher(msg, args) {
        if (!this.checkArgument(msg, args)) return true;
        let name = args[0].toLowerCase();

        if ((this.GetCommand() === "teacher" && this.checkName(name)) || (this.GetCommand() === "doctorate" && this.checkName(name))) {
            Main.Database.Select(Main.Config.database.queries.select.userById, [msg.member.id]).then(rows => {
                if (rows.length > 0) {
                    if (rows[0].active === 0) {
                        Main.Database.Run(Main.Config.database.queries.update.userActivityById, [1, msg.member.id]);
                    } else {
                        msg.reply(Main.Messages.userActive[0]).then(msg => {
                            Messenger.DeleteAfter(msg, Main.Config.messenger.deleteAfter);
                        });
                        return;
                    }
                } else {
                    Main.Database.Run(Main.Config.database.queries.insert.user, [msg.member.id, name, 2, this.GetCommand() === "teacher" ? 2 : 3, this.generateVerificationString()]);
                    msg.reply(Main.Messages.teacherVerify).then(msg => {
                        Messenger.DeleteAfter(msg, Main.Config.messenger.deleteAfter);
                    });
                }
                msg.reply(Main.Messages.teacherAcceptance).then(msg => {
                    Messenger.DeleteAfter(msg, Main.Config.messenger.deleteAfter);
                });
                Channels.GetChannel(Main.Config.channels.teachersAccounts)
                        .send(Roles.GetRole(Main.Config.roles.adminHelpRole)
                                   .toString() + ", " + Formatter.Format(Main.Messages.teacherAcceptanceAdmin, [Messenger.GetName(msg.member)]));
            });
        }

        return true;
    }

    onHelp(msg, args) {
        Channels.GetChannel(Main.Config.channels.bot)
                .send(Roles.GetRole(Main.Config.roles.adminHelpRole)
                           .toString() + ", " + Formatter.Format(Main.Messages.welcomeHelpAdmin, [Messenger.GetName(msg.member)]));
        return true;
    }

    onVerify(msg, args) {
        if (args.length !== 1) return true;
        let code = args[0];
        Main.Database.Select(Main.Config.database.queries.select.userById, [msg.member.id]).then(rows => {
            if (rows.length === 0) return;
            if (code === rows[0].verification) {
                Roles.AddRole(msg.member, rows[0].type === 0 ? Main.Config.roles.studentRole : rows[0].type === 1 ? Main.Config.roles.erasmusRole : Main.Config.roles.teacherRole);
                if (rows[0].type === 1)
                    Roles.AddRole(msg.member, Main.Config.roles.studentRole);
                Main.Database.Run(Main.Config.database.queries.update.userActivityById, [1, msg.member.id]);
            } else {
                let verificationStringTranslation = rows[0].type;
                if (verificationStringTranslation > 1) verificationStringTranslation = 0;
                msg.reply(Main.Messages.wrongVerificationCode[verificationStringTranslation]).then(msg => {
                    Messenger.DeleteAfter(msg, Main.Config.messenger.deleteAfter);
                });
            }
        });
        return true;
    }

    onHost(msg, args) {
        Roles.AddRole(msg.member, Main.Config.roles.hostRole);
    }

    onAbsolvent(msg, args) {
        Roles.AddRole(msg.member, Main.Config.roles.absolventRole);
    }

    checkArgument(msg, args) {
        let isErasmus = this.GetCommand() === "erasmus";
        if (args.length !== 1) {
            msg.reply(Main.Messages.noLoginIncluded[isErasmus ? 1 : 0]).then(msg => {
                Messenger.DeleteAfter(msg, Main.Config.messenger.deleteAfter);
            });
            return false;
        } else if (args.length === 1 && args[0].toLowerCase() === "login") {
            msg.reply(Main.Messages.stupidLoginIncluded[isErasmus ? 1 : 0]).then(msg => {
                Messenger.DeleteAfter(msg, Main.Config.messenger.deleteAfter);
            });
            return false;
        }
        return true;
    }

    /**
     * @author MP
     * @param {string} name
     * @return {boolean}
     */
    checkName(name) {
        if (name.length > 7)
            return false;

        // let name_arr = name.split('');
        //
        // for (let i = 0; i <= 2; ++i) {
        //     if (!isNaN(parseInt(name_arr[i]))) {
        //         return 0;
        //     }
        // }
        //
        // if (name_arr.length > 3 && name_arr.length < 7) {
        //     for (let i = 3; i < name_arr.length; ++i) {
        //         if (isNaN(parseInt(name_arr[i]))) {
        //             return 0;
        //         }
        //     }
        //     return 2;
        // }
        //
        // for (let i = 3; i < 7; ++i) {
        //     if (isNaN(parseInt(name_arr[i]))) {
        //         return 0;
        //     }
        // }
        return true;
    }

    async OnMessage(msg) {
        if ([Main.Config.channels.welcome, Main.Config.channels.welcomeEnglish].indexOf(msg.channel.id) === -1) return;
        if (Main.Config.logCommands) Channels.GetChannel(Main.Config.channels.bot)
                                             .send("**" + Messenger.GetName(msg.member) + "**: " + msg.content);
        await msg.delete();
    }

    async OnServerLeave(member) {
        Main.Database.Select(Main.Config.database.queries.select.userById, [member.id]).then(rows => {
            if (rows.length !== 1) {
                return;
            }
            if (rows[0].activity === 1) Main.Database.Run(Main.Config.database.queries.update.userActivityById, ["0", member.id]);
        });
    }

    // OnCommand(msg, command, args) {
    //     if ([Main.Config.channels.welcome, Main.Config.channels.welcomeEnglish].indexOf(msg.channel.id) === -1) return false;
    //
    //     if (["student", "teacher", "doctorate", "erasmus"].indexOf(command) !== -1 && !Roles.HasRole(msg.member, Main.Config.roles.studentRole) && !Roles.HasRole(msg.member, Main.Config.roles.studentRole)) {
    //         if (args.length !== 1) {
    //             msg.reply(Main.Messages.noLoginIncluded).then(msg => {
    //                 Messenger.DeleteAfter(msg, Main.Config.messenger.deleteAfter);
    //             });
    //             return true;
    //         }
    //         let name = args[0].toLowerCase();
    //         if (command === "student" || command === "erasmus") {
    //             if (this.checkName(name) === 1) {
    //                 Main.Database.Select(Main.Config.database.queries.select.userById, [msg.member.id]).then(rows => {
    //                     if (rows.length > 0) {
    //                         if (rows[0].active === 0) {
    //                             Main.Database.Run(Main.Config.database.queries.update.userActiveById, [1, msg.member.id]);
    //                             Roles.AddRole(msg.member, Main.Config.roles.studentRole);
    //                         } else {
    //                             msg.reply(Main.Messages.userActive).then(msg => {
    //                                 Messenger.DeleteAfter(msg, Main.Config.messenger.deleteAfter);
    //                             });
    //                         }
    //                     } else {
    //                         Main.Database.Run(Main.Config.database.queries.insert.user, [msg.member.id, name, 1]);
    //                         Roles.AddRole(msg.member, command === "student" ? Main.Config.roles.studentRole : Main.Config.roles.erasmusRole);
    //                     }
    //                 });
    //             } else {
    //                 msg.reply(Main.Messages.wrongLogin).then(msg => {
    //                     Messenger.DeleteAfter(msg, Main.Config.messenger.deleteAfter);
    //                 });
    //             }
    //         } else if (command === "teacher" || command === "doctorate") {
    //             if ((command === "teacher" && this.checkName(name) === 2) || (command === "doctorate" && this.checkName(name) === 1)) {
    //                 Main.Database.Select(Main.Config.database.queries.select.userById, [msg.member.id]).then(rows => {
    //                     if (rows.length > 0) {
    //                         if (rows[0].active === 0) {
    //                             Main.Database.Run(Main.Config.database.queries.update.userActiveById, [2, msg.member.id]);
    //                         } else {
    //                             msg.reply(Main.Messages.userActive).then(msg => {
    //                                 Messenger.DeleteAfter(msg, Main.Config.messenger.deleteAfter);
    //                             });
    //                             return;
    //                         }
    //                     } else {
    //                         Main.Database.Run(Main.Config.database.queries.insert.user, [msg.member.id, name, 2]);
    //                     }
    //                     msg.reply(Main.Messages.teacherAcceptance).then(msg => {
    //                         Messenger.DeleteAfter(msg, Main.Config.messenger.deleteAfter);
    //                     });
    //                     Channels.GetChannel(Main.Config.channels.uciteleUcty)
    //                             .send(Formatter.Format(Main.Messages.teacherAcceptanceAdmin, [Roles.GetRole(Main.Config.roles.adminHelpRole)
    //                                                                                                .toString(), Messenger.GetName(msg.member)]));
    //                 });
    //             }
    //             return true;
    //         }
    //
    //         return true;
    //     }
    //
    //     return false;
    // }
}

module.exports = VerificationService;