/**
 * User: Bc. Milián Daniel
 * Date: 24/08/2021
 * Time: 19:34
 */
import {Service} from "../service";
import * as Main from "../main";
import {Message} from "discord.js";
import * as Roles from "../libs/Roles";
import * as Messenger from "../libs/Messenger";
import * as Mail from "../libs/Mail";
import * as Formatter from "../libs/Formatter";
import * as Files from "../libs/Files";
import * as Channels from "../libs/Channels";
import {ButtonInteractionWrap} from "../types/ButtonInteractionWrap";
import * as Axios from "axios";

export class VerificationService extends Service {
    private readonly ssoAddress: string;

    constructor() {
        super();
        this.bot = Main.GetBot("porter");
        // this.allowedChannels = [Main.Config.channels.welcome];
        this.ssoAddress = Main.Auth.sso.url;

        let data = {"forbiddenRoles": [Main.Config.roles.hostRole, Main.Config.roles.studentRole, ...Main.Config.roles.otherRoles]};
        // this.RegisterLegacyCommand("student", this.onStudent, data);
        // this.RegisterLegacyCommand("erasmus", this.onStudent, data);
        // this.RegisterLegacyCommand("teacher", this.onTeacher, data);
        // this.RegisterLegacyCommand("doctorate", this.onTeacher, data);
        // this.RegisterLegacyCommand("help", this.onHelp, data);
        // this.RegisterLegacyCommand("verify", this.onVerify, data);
        // this.RegisterLegacyCommand("host", this.onHost, data);
        // this.RegisterLegacyCommand("absolvent", this.onAbsolvent, data);

        this.DefineButtonBehavior("special.sso", this.behaviorSpecialSso);

        this.RegisterLegacyCommand("tempv", this.tempVerification);
    }

    public async VerifyStudent(userId: string, email: string, login: string, firstName: string, lastName: string): Promise<void> {
        let isTeacher: boolean = false;
        let result: Axios.AxiosResponse = await Axios.default.get(Main.Config.services.VerificationService.teacherUrlPrefix + login, {
            maxRedirects: 50,
            headers:{
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36 Edg/95.0.1020.38",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "Connection": "keep-alive"
            },
            validateStatus: () => true
        });
        if (result.status === 200)
            isTeacher = true;
        console.log(result.status+": "+isTeacher);

        login = login.toLowerCase();
        let rows: any[] = await Main.Database.Select(Main.Config.database.queries.select.userByLogin, [login]);
        if (rows.length >= 1 && rows[0]["id"] !== userId) {
            // If current login is used, throw an error.
            return;
        }
        rows = await Main.Database.Select(Main.Config.database.queries.select.userById, [userId]);
        if (rows.length >= 1) {
            if (rows[0]["login"] !== login) {
                // TODO: If current userId is used, but login is different, throw an error.
                return;
            }
            Main.Database.Run(Main.Config.database.queries.update.userInfoById, [
                login,
                1,
                `${firstName} ${lastName} (${email})`,
                userId
            ]);
        } else {
            Main.Database.Run(Main.Config.database.queries.insert.userFull, [
                userId,
                login,
                1,
                isTeacher ? 2 : 0,
                this.generateVerificationString(),
                `${firstName} ${lastName} (${email})`
            ]);
        }

        if (isTeacher)
            await Roles.AddRole(await Messenger.GetMemberById(userId), Main.Config.roles.teacherRole);
        else
            await Roles.AddRole(await Messenger.GetMemberById(userId), Main.Config.roles.studentRole);
    }

    public async tempVerification(msg: Message, args: string[]): Promise<void> {
        this.VerifyStudent("141283180341755904", "mil0068@vsb.cz", "mil0068", "Daniel", "Milian");
    }

    private async behaviorSpecialSso(interaction: ButtonInteractionWrap, args: string[]): Promise<void> {
        let address: string = this.ssoAddress;
        await interaction.interaction.reply({
            content: `**Tvůj SSO odkaz: **${address + "/?_=" + interaction.caller.id}\n\nPo úspěšném přihlášení bys měl získat příslušnou roli během chvile.\nPokud se tak nestane, prosím kontaktuj administrátory, kteří ti pomohou vyřešit tento problém.`,
            ephemeral: true
        });
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

    async onStudent(msg: Message, args: string[]): Promise<boolean> {
        if (!this.checkArgument(msg, args)) return true;
        let name = args[0].toLowerCase();
        let isErasmus = this.currentCommand !== "student";

        if (this.checkName(name)) {
            Main.Database.Select(Main.Config.database.queries.select.userById, [msg.member.id]).then(async rows => {
                if (rows.length > 0) {
                    if (rows[0].activity === 0) {
                        Main.Database.Run(Main.Config.database.queries.update.userActivityById, [1, msg.member.id]);
                        await Roles.AddRole(msg.member, Main.Config.roles.studentRole);
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

    onTeacher(msg: Message, args: string[]) {
        if (!this.checkArgument(msg, args)) return true;
        let name = args[0].toLowerCase();

        if ((this.currentCommand === "teacher" && this.checkName(name)) || (this.currentCommand === "doctorate" && this.checkName(name))) {
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
                    Main.Database.Run(Main.Config.database.queries.insert.user, [msg.member.id, name, 2, this.currentCommand === "teacher" ? 2 : 3, this.generateVerificationString()]);
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

    async onHelp(msg: Message, args: string[]) {
        await Channels.GetChannel(Main.Config.channels.bot)
            .send(Roles.GetRole(Main.Config.roles.adminHelpRole)
                .toString() + ", " + Formatter.Format(Main.Messages.welcomeHelpAdmin, [Messenger.GetName(msg.member)]));
        return true;
    }

    onVerify(msg: Message, args: string[]) {
        if (args.length !== 1) return true;
        let code = args[0];
        Main.Database.Select(Main.Config.database.queries.select.userById, [msg.member.id]).then(async rows => {
            if (rows.length === 0) return;
            if (code === rows[0].verification) {
                await Roles.AddRole(msg.member, rows[0].type === 0 ? Main.Config.roles.studentRole : rows[0].type === 1 ? Main.Config.roles.erasmusRole : Main.Config.roles.teacherRole);
                if (rows[0].type === 1)
                    await Roles.AddRole(msg.member, Main.Config.roles.studentRole);
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

    async onHost(msg: Message, args: string[]) {
        await Roles.AddRole(msg.member, Main.Config.roles.hostRole);
    }

    async onAbsolvent(msg: Message, args: string[]) {
        await Roles.AddRole(msg.member, Main.Config.roles.absolventRole);
    }

    checkArgument(msg: Message, args: string[]) {
        let isErasmus = this.currentCommand === "erasmus";
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
        return name.length <= 7;

    }

    async OnMessage(msg) {
        if ([Main.Config.channels.welcome].indexOf(msg.channel.id) === -1) return;
        if (Main.Config.logCommands) await Channels.GetChannel(Main.Config.channels.bot)
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
}