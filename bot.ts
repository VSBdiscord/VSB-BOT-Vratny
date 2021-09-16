/**
 * User: Bc. Milián Daniel
 * Date: 27/07/2021
 * Time: 18:13
 */

import * as Discord from "discord.js";

import * as Logger from "./libs/Logger";
import * as Services from "./libs/Services";
import {
    ApplicationCommand,
    ApplicationCommandPermissionData,
    GuildMember,
    Intents,
    MessageReaction,
    User
} from "discord.js";
import {REST} from "@discordjs/rest";
import {APIApplicationCommand, Routes} from "discord-api-types/v9";
import {SlashCommandWrap} from "./types/SlashCommandWrap";

export class Bot {
    name: string;
    token: string;
    client: Discord.Client;
    guild: Discord.Guild;

    constructor(name: string, token: string) {
        this.name = name;
        this.token = token;
        // this.intents = new Discord.Intents(Discord.Intents.ALL);
        this.client = new Discord.Client({
            intents: [
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.DIRECT_MESSAGES,
                Intents.FLAGS.GUILDS,
            ]
        });
        this.guild = null;

        const rest = new REST({version: "9"}).setToken(token);

        this.client.on("ready", async () => {
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
            await Services.OnStart(this);
            let commands: SlashCommandWrap[] = [];
            for (let service of Services.GetBotServices(this)) {
                commands.push(...service.commands);
            }
            await rest.put(
                Routes.applicationGuildCommands(this.client.user.id, "631124326522945546"),
                {body: commands.map(value => value.builder.toJSON())}
            ).then(async value => {
                let data: APIApplicationCommand[] = value as APIApplicationCommand[];
                for (let command of data) {
                    for (let serviceCommand of commands) {
                        if (serviceCommand.roles === null || serviceCommand.builder.name !== command.name) {
                            continue;
                        }
                        const permission: ApplicationCommandPermissionData[] = [];
                        for (let role of serviceCommand.roles) {
                            permission.push({
                                id: role,
                                type: "ROLE",
                                permission: true
                            });
                        }
                        let applicationCommand: ApplicationCommand = await this.client.guilds.cache.first().commands.fetch(command.id, {cache: true});
                        await applicationCommand.permissions.add({permissions: permission});
                    }
                }
            });
            Logger.Info("Bot " + this.client.user.username + " is ready.");
        });

        this.client.on("message", (msg) => {
            Services.OnMessage(msg).finally();
        });

        this.client.on("guildMemberAdd", (member) => {
            Services.OnServerJoin(member).finally();
        });

        this.client.on("guildMemberRemove", (member) => {
            Services.OnServerLeave(member as GuildMember).finally();
        });

        this.client.on("messageReactionAdd", (reaction, user) => {
            Services.OnReactionAdd(reaction as MessageReaction, user as User).finally();
        });

        this.client.on("messageReactionRemove", (reaction, user) => {
            Services.OnReactionRemove(reaction as MessageReaction, user as User).finally();
        });

        this.client.on("interactionCreate", async (interaction) => {
            if (interaction.isButton()) {
                Services.OnButtonInteraction(interaction).finally();
            } else if (interaction.isCommand()) {
                Services.OnCommandInteraction(interaction).finally();
            }
        });

        this.client.login(token).finally();
    }
}