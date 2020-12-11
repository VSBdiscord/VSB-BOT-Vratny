/**
 * User: Cloudy
 * Date: 30/09/2020
 * Time: 20:07
 */

const Service = require("../service");
const Main = require("../main");
const Logger = require("../libs/Logger");
const Roles = require("../libs/Roles");
const Messenger = require("../libs/Messenger");
const Channels = require("../libs/Channels");
const Formatter = require("../libs/Formatter");
const SystemInformation = require("systeminformation");
const Discord = require("discord.js");
const Zombie = require("zombie");

/**
 * @author DM
 */
class StudentInfoScraperService extends Service {
    constructor() {
        super();

        this.bot = Main.GetBot("porter");
        let data = {"requiredRole": Main.Config.roles.adminHelpRole};
        this.RegisterCommand("scrapinfo", this.onScrapInfo, data);
    }

    checkIfCredentialsSet(channel) {
        if (!('edison' in Main.Auth)) {
            channel.send("No edison credentials are set!");
            return false;
        }
        return true;
    }

    async onScrapInfo(msg, args) {
        if (!this.checkIfCredentialsSet(msg.channel) || args.length !== 1)
            return;

        let member = await Messenger.GetMemberById(args[0]);
        if (member === undefined) {
            msg.channel.send("Unknown member set.");
            return;
        }
        msg.channel.send("Reading " + Messenger.GetName(member) + "'s info from database...");
        Main.Database.Select(Main.Config.database.queries.select.userById, [member.id]).then(data => {
            if (data.length !== 1) {
                msg.channel.send("No info found in database.");
                return;
            }
            if (data[0].scrap_real_name !== null) {
                msg.channel.send("**Real name**: " + data[0].scrap_real_name);
                return;
            }
            const browser = new Zombie();
            msg.channel.send("Logging into SSO...");
            browser.visit("https://www.sso.vsb.cz/login", () => {
                browser.fill("#username", Main.Auth.edison.login);
                browser.fill("#password", Main.Auth.edison.pass);
                browser.document.forms[0].submit();
                browser.wait().then(() => {
                    msg.channel.send("Searching for student " + data[0].login + " ...");
                    browser.visit("https://edison.sso.vsb.cz/wps/myportal/student/informace/studenti", () => {
                        browser.fill(browser.queryAll(".inputText")[2], data[0].login);
                        browser.pressButton(browser.queryAll("input[type=submit]")[0]);
                        browser.wait().then(() => {
                            let name = browser.queryAll(".evenRow td span")[2].innerHTML;
                            let nameSplit = name.split(" ");
                            name = nameSplit[nameSplit.length - 1] + " " + nameSplit.slice(1, nameSplit.length - 2)
                                                                                    .join(" ") + (nameSplit.length > 2 ? " " : "") + nameSplit[0];
                            msg.channel.send("**Real name**: " + name);
                            Main.Database.Run(Main.Config.database.queries.update.userScrapRealNameById, [name, member.id]);
                        }).catch(() => {});
                    });
                }).catch(() => {});
            });
        });
    }
}

module.exports = StudentInfoScraperService;