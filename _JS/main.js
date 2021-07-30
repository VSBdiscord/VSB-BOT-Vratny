/**
 * User: Cloudy
 * Date: 22/03/2020
 * Time: 22:00
 */

const Bot = require("./bot");
const Services = require("./libs/Services");
const Logger = require("./libs/Logger");

exports.Config = require("../config.json");
exports.Messages = require("../messages.json");
exports.Auth = require("../auth.json");
exports.Database = require("./libs/Db");
exports.Mail = require("./libs/Mail");
exports.Package = require("../package.json");

const VerificationService = require("./services/VerificationService");
const StudentCheckService = require("./services/StudentCheckService");
const AdminService = require("./services/AdminService");
const ChannelCleanService = require("./services/ChannelCleanService");
const PostingService = require("./services/PostingService");
const PollService = require("./services/PollService");
const StudentInfoScraperService = require("./services/StudentInfoScraperService");
const WebService = require("./services/WebService");
const CheckerLogService = require("./services/CheckerLogService");
//const PinService = require("./services/PinService");
//const PermissionService = require("./services/PermissionService");
const DatabaseManagerService = require("./services/DatabaseManagerService");

let bots = [];
let currentBot = null;

/**
 * Returns bot by name.
 * @param {string} name
 * @return {Bot}
 */
exports.GetBot = (name) => {
    for (let i = 0; i < bots.length; ++i) {
        if (bots[i].name === name) return bots[i];
    }
    return null;
};

/**
 * Sets current executing bot.
 * @param {Client} client
 */
exports.SetCurrentBot = (client) => {
    for (let i = 0; i < bots.length; ++i) {
        if (bots[i].client === undefined)
            continue;
        if (bots[i].client.user.id === client.user.id) {
            currentBot = bots[i];
            return;
        }
    }
};

/**
 * Returns current executing bot.
 * @return {Bot}
 */
exports.GetCurrentBot = () => {
    return currentBot;
};

/**
 * Checks if specified ID is bot's ID.
 * @param {string} id
 * @return {boolean}
 */
exports.IsBotId = (id) => {
    for (let i = 0; i < bots.length; ++i) {
        if (bots[i].client.user.id === id) return true;
    }
    return false;
};

let start = () => {
    let keys = Object.keys(this.Auth.bots);
    for (let i = 0; i < keys.length; ++i) {
        let token = this.Auth.bots[keys[i]];
        bots.push(new Bot(keys[i], token));
    }

    Services.AddService(new VerificationService());
    // Services.AddService(new StudentCheckService());
    Services.AddService(new AdminService());
    Services.AddService(new ChannelCleanService());
    Services.AddService(new PostingService());
    Services.AddService(new PollService());
    Services.AddService(new StudentInfoScraperService());
    Services.AddService(new WebService());
    Services.AddService(new CheckerLogService());
    //Services.AddService(new PinService());
    //Services.AddService(new PermissionService());
    Services.AddService(new DatabaseManagerService());
    Logger.Info("Ready. Version: " + this.Package.version);
};

start();
// const DB = require("./libs/Db");
// DB.Select("SELECT * FROM vsb_disc.users", []).then(rows => {
//     console.log(rows.length);
//     DB.Select("SELECT * FROM vsb_disc.users", []).then(rows => {
//         console.log(rows.length);
//     });
// });
// this.Mail.Send("mil0068@vsb.cz", "test", "test");

// const Discord = require("discord.js");
// exports.Client = new Discord.Client();
// const Logger = require("./libs/logger");
// exports.Config = require("./config");
// exports.Messages = require("./messages");
// const Services = require("./libs/services");
// exports.Database = require("./libs/db");
//
// const VerificationService = require("./services/VerificationService");
// const StudentCheckService = require("./services/StudentCheckService");
// const AdminService = require("./services/AdminService");

// this.Client.on("ready", () => {
//     this.Guild = this.Client.guilds.cache.first();
//
//     Services.AddService(new VerificationService());
//     // Services.AddService(new StudentCheckService());
//     Services.AddService(new AdminService());
//     Logger.Info("Bot ready!");
//     Services.OnStart();
// });
//
// this.Client.on("message", (msg) => {
//     Services.OnMessage(msg);
// });
//
// this.Client.login(this.Config.token);