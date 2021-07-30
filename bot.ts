/**
 * User: Bc. Milián Daniel
 * Date: 27/07/2021
 * Time: 18:13
 */

import * as Discord from "discord.js";

import * as Main from "./main";
const Logger = require("./libs/Logger");
const Services = require("./libs/Services");

export class Bot {
    name: string;
    token: string;
    client: Discord.Client;
    guild: Discord.Guild;

    constructor(name: string, token: string) {
        this.name = name;
        this.token = token;
        // this.intents = new Discord.Intents(Discord.Intents.ALL);
        this.client = new Discord.Client({fetchAllMembers: false});
        this.guild = null;

        this.client.on("ready", () => {
            this.guild = this.client.guilds.cache.first();
            if (this.guild === undefined) {
                Logger.Error("Bot " + this.client.user.username + " can't load server.");
                this.client.destroy();
                return;
            }
            // Logger.Info("Bot " + this.client.user.username + " is fetching members...");
            // this.guild.members.fetch().then(members => {
            //     Logger.Info("fetched members");
            //     Services.OnStart(this.client);
            // }).catch(err => {
            //     Logger.Error("Error while fetching all server members.");
            // });
            Services.OnStart(this.client);
            Logger.Info("Bot " + this.client.user.username + " is ready.");
        });

        this.client.on("message", (msg) => {
            Services.OnMessage(msg);
        });

        this.client.on("guildMemberAdd", (member) => {
            Services.OnServerJoin(member);
        });

        this.client.on("guildMemberRemove", (member) => {
            Services.OnServerLeave(member);
        });

        this.client.on("messageReactionAdd", (reaction, user) => {
            Services.OnReactionAdd(reaction, user);
        });

        this.client.on("messageReactionRemove", (reaction, user) => {
            Services.OnReactionRemove(reaction, user);
        });

        this.client.login(token);
    }
}