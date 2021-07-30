/**
 * User: Bc. Milián Daniel
 * Date: 27/07/2021
 * Time: 18:07
 */

import {Bot} from "./bot";

const Services = require("./libs/Services");
const Logger = require("./libs/Logger");
import {Client} from "discord.js";

export const Config = require("./config.json");
export const Messages = require("./messages.json");
export const Auth = require("./auth.json");
export const Database = require("./libs/Db");
export const Mail = require("./libs/Mail");
export const Package = require("./package.json");

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

let bots: Bot[] = [];
let currentBot: Bot = null;

/**
 * Returns bot by name.
 * @param {string} name
 * @return {Bot}
 */
export function GetBot(name: string) {
    for (let i = 0; i < bots.length; ++i) {
        if (bots[i].name === name) return bots[i];
    }
    return null;
}

/**
 * Sets current executing bot.
 * @param {Client} client
 */
export function SetCurrentBot(client: Client) {
    for (let i = 0; i < bots.length; ++i) {
        if (bots[i].client === undefined)
            continue;
        if (bots[i].client.user.id === client.user.id) {
            currentBot = bots[i];
            return;
        }
    }
}

/**
 * Returns current executing bot.
 * @return {Bot}
 */
export function GetCurrentBot() {
    return currentBot;
}

/**
 * Checks if specified ID is bot's ID.
 * @param {string} id
 * @return {boolean}
 */
export function IsBotId(id: string) {
    for (let i = 0; i < bots.length; ++i) {
        if (bots[i].client.user.id === id) return true;
    }
    return false;
}

let start = () => {
    let keys = Object.keys(Auth.bots);
    for (let i = 0; i < keys.length; ++i) {
        let token = Auth.bots[keys[i]];
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
    Logger.Info("Ready. Version: " + Package.version);
};

start();