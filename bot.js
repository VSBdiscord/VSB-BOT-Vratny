const Discord = require("discord.js");
const Logger = require("./libs/Logger");
const Services = require("./libs/Services");
const Main = require("./main");

/**
 * @author DM
 */
class Bot {
    /**
     * @param {string} name
     * @param {string} token
     */
    constructor(name, token) {
        this.name = name;
        this.token = token;
        this.client = new Discord.Client();
        this.guild = null;

        this.client.on("ready", () => {
            this.guild = this.client.guilds.cache.first();
            if (this.guild === undefined) {
                Logger.Error("Bot " + this.client.user.username + " can't load server.");
                this.client.destroy();
                return;
            }
            // Logger.Info("Bot " + this.client.user.username + " is fetching members...");
            this.guild.members.fetch().then(members => {
                Services.OnStart(this.client);
            });
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

module.exports = Bot;