/**
 * User: Bc. Milián Daniel
 * Date: 12/09/2021
 * Time: 14:13
 */
import {Service} from "../service";
import * as Main from "../main";
import {
    CommandInteraction,
    GuildChannel,
    GuildMember,
    Message,
    MessageActionRow,
    MessageButton, MessageButtonStyleResolvable, MessageEditOptions, Role,
    TextChannel
} from "discord.js";
import * as Messenger from "../libs/Messenger";
import * as Formatter from "../libs/Formatter";
import * as Roles from "../libs/Roles";
import * as Logger from "../libs/Logger";
import {ButtonInteractionWrap} from "../types/ButtonInteractionWrap";
import {SlashCommandBuilder} from "@discordjs/builders";
import {ButtonBehaviorHandler} from "../types/ButtonBehaviorHandler";
import {StringUtils} from "../libs/StringUtils";
import {BotLogger} from "../libs/BotLogger";
import {SharedSlashCommandOptions} from "@discordjs/builders/dist/interactions/slashCommands/mixins/CommandOptions";

export class MessageManagerService extends Service {
    constructor() {
        super();
        this.bot = Main.GetBot("porter");

        // let adminData: {} = {
        //     "requiredRole": Main.Config.roles.developerRole
        // };
        // this.RegisterLegacyCommand("appendbutton", this.onAppendButton, adminData);

        this.DefineButtonBehavior("template", this.behaviorTemplate);
        this.DefineButtonBehavior("set.role", this.behaviorSetRole);
        this.DefineButtonBehavior("set.permission", this.behaviorSetPermission);
        this.DefineButtonBehavior("simple.response", this.behaviorSimpleResponse);
        this.DefineButtonBehavior("hidden.response", this.behaviorHiddenResponse);
        this.DefineButtonBehavior("simple.percentage", this.behaviorSimplePercentage);

        this.RegisterSlashCommand(
            new SlashCommandBuilder()
                .setName("appendbutton")
                .setDescription("Appends a button to the message")
                .addChannelOption(option => option.setName("channel")
                    .setDescription("Target channel")
                    .setRequired(true))
                .addStringOption(option => option.setName("message")
                    .setDescription("Target message id")
                    .setRequired(true))
                .addStringOption(option => option.setName("behavior")
                    .setDescription("Button behavior script")
                    .setRequired(true))
                .addStringOption(option => option.setName("label")
                    .setDescription("Button label")
                    .setRequired(false))
                .addStringOption(option => option.setName("emoji")
                    .setDescription("Button emoji")
                    .setRequired(false))
                .addStringOption(option => option.setName("style")
                    .setDescription("Button style")
                    .setRequired(false)
                    .addChoice("PRIMARY", "PRIMARY")
                    .addChoice("SECONDARY", "SECONDARY")
                    .addChoice("SUCCESS", "SUCCESS")
                    .addChoice("DANGER", "DANGER")
                    .addChoice("LINK", "LINK"))
                .addIntegerOption(option => option.setName("row")
                    .setDescription("Component row")
                    .setRequired(false))
                .addStringOption(option => option.setName("args")
                    .setDescription("Additional arguments")
                    .setRequired(false)),
            this.slashCommandAppendButton,
            [Main.Config.roles.adminRole]
        );

        this.RegisterSlashCommand(
            new SlashCommandBuilder()
                .setName("deletebutton")
                .setDescription("Deletes button by its position")
                .addChannelOption(option => option.setName("channelid")
                    .setDescription("a")
                    .setRequired(true))
                .addStringOption(option => option.setName("messageid")
                    .setDescription("b")
                    .setRequired(true))
                .addIntegerOption(option => option.setName("buttonrow")
                    .setDescription("c")
                    .setRequired(true))
                .addIntegerOption(option => option.setName("buttoncol")
                    .setDescription("d")
                    .setRequired(true)),
            this.slashCommandDeleteButton,
            [Main.Config.roles.adminRole]
        );

        this.RegisterSlashCommand(
            new SlashCommandBuilder()
                .setName("message")
                .setDescription("Send a message as a bot")
                .addStringOption(option =>
                    option.setName("input")
                        .setDescription("Input text")
                        .setRequired(true)
                ),
            this.slashCommandMessage,
            [Main.Config.roles.adminRole]
        );

        this.RegisterSlashCommand(
            new SlashCommandBuilder()
                .setName("embed")
                .setDescription("Send an embed message as a bot")
                .addStringOption(option =>
                    option.setName("json")
                        .setDescription("JSON input")
                        .setRequired(true)
                ),
            this.slashCommandEmbed,
            [Main.Config.roles.adminRole]
        );

        this.RegisterSlashCommand(
            new SlashCommandBuilder()
                .setName("privatemsg")
                .setDescription("Send client-side message to the user.")
                .setDefaultPermission(true)
                .addStringOption(option =>
                    option.setName("input")
                        .setDescription("What will be given back")
                        .setRequired(true)),
            async commandInteraction => {
                await commandInteraction.reply({
                    content: commandInteraction.options.get("input", true).value as string,
                    ephemeral: true
                });
            }
        );
    }

    private async slashCommandAppendButton(interaction: CommandInteraction): Promise<void> {
        let abstractChannel: GuildChannel = interaction.options.getChannel("channel", true) as GuildChannel;
        if (abstractChannel.type !== "GUILD_TEXT") {
            return;
        }
        let channel: TextChannel = abstractChannel as TextChannel;
        let messageId: string = interaction.options.getString("message", true) as string;
        let label: string | null = interaction.options.getString("label", false);
        let emoji: string | null = interaction.options.getString("emoji", false);
        if (label === null && emoji === null) {
            return;
        }
        let behavior: string = interaction.options.getString("behavior", true) as string;
        let style: string | null = interaction.options.getString("style", false);
        if (style === null) {
            style = "PRIMARY";
        }
        let row: number | null = interaction.options.getInteger("row", false);
        let args: string | null = interaction.options.getString("args", false);
        if (args === null) {
            args = "";
        }
        let argsArray: string[] = args.length !== 0 ? StringUtils.Split(args, " ") : [];

        let behaviorHandler: ButtonBehaviorHandler | undefined = Service.globalData.GetButtonBehavior(behavior);
        if (behaviorHandler === undefined) {
            return;
        }

        let message: Message = await Messenger.GetMessageById(channel.id, messageId);
        if (message === undefined) {
            return;
        }

        let componentIndex: number = row !== null && row !== undefined ? row as number : 0;
        let components = message.components;
        if (components.length <= componentIndex) {
            for (let i = components.length; i <= componentIndex; ++i) {
                components.push(new MessageActionRow());
            }
        }
        let argList: string = "";
        for (let string of argsArray) {
            argList += (argList.length > 0 ? "," : "") + `"${string}"`;
        }
        let identifier: string = channel.id + "_" + messageId + "_" + componentIndex + components[componentIndex].components.length.toString(); // TODO: Bug possible due to components clearing.
        let fullId: string = `[${behavior}]${Formatter.Simplify(identifier)}{${argList}}`;
        let shortId: string = Formatter.Simplify(identifier);
        let messageButton: MessageButton = new MessageButton()
            .setCustomId(fullId)
            .setStyle(style as MessageButtonStyleResolvable);
        if (label !== null) {
            messageButton.setLabel(label);
        }
        if (emoji !== null) {
            let emojiId: string = emoji;
            if (emoji.indexOf(":") > -1) {
                let regex: RegExp = /<:\w+:(\d+)>|(\d+)/g;
                let match: RegExpExecArray = regex.exec(emoji);
                emojiId = match[1].length > 0 ? match[1] : match[2];
            }
            messageButton.setEmoji(emojiId);
        }
        components[componentIndex].addComponents(
            messageButton
        );
        // Check if any components are empty, then delete...
        for (let i = 0; i < components.length; ++i) {
            if (components[i].components.length === 0) {
                components.splice(i, 1);
                i--;
            }
        }

        let data: MessageEditOptions = {
            embeds: message.embeds,
            components: components
        };
        if (message.content.length > 0) {
            data["content"] = message.content;
        }
        message.edit(data).then(() => {
            interaction.reply({
                content: `Button added! ShortID: \`${shortId}\`, FullID: \`${fullId}\``,
                ephemeral: true
            }).finally();
        }).catch(reason => {
            BotLogger.Warn("Failed to edit message: " + reason.message).finally();
            interaction.reply({
                content: `Button failed: \`${reason.message}\``,
                ephemeral: true
            }).finally();
        }).finally();

    }

    private async slashCommandDeleteButton(interaction: CommandInteraction): Promise<void> {
        let abstractChannel: GuildChannel = interaction.options.getChannel("channelid", true) as GuildChannel;
        if (abstractChannel.type !== "GUILD_TEXT") {
            return;
        }
        let channel: TextChannel = abstractChannel as TextChannel;
        let messageId: string = interaction.options.getString("messageid", true) as string;
        let buttonRow: number = interaction.options.getInteger("buttonrow", true) as number;
        let buttonCol: number = interaction.options.getInteger("buttoncol", true) as number;

        let message: Message = await Messenger.GetMessageById(channel.id, messageId);
        if (message === undefined) {
            return;
        }

        let components: MessageActionRow[] = message.components;
        if (components.length <= buttonRow) {
            return;
        }

        if (components[buttonRow].components.length <= buttonCol) {
            return;
        }

        components[buttonRow].spliceComponents(buttonCol, 1);
        if (components[buttonRow].components.length == 0) {
            components.splice(buttonRow, 1);
        }

        let data: MessageEditOptions = {
            embeds: message.embeds,
            components: components
        };
        if (message.content.length > 0) {
            data["content"] = message.content;
        }
        message.edit(data).then(() => {
            interaction.reply({
                content: `Button deleted!`,
                ephemeral: true
            }).finally();
        }).catch(reason => {
            BotLogger.Warn("Failed to edit message: " + reason.message).finally();
            interaction.reply({
                content: `Button failed: \`${reason.message}\``,
                ephemeral: true
            }).finally();
        }).finally();
    }

    private async slashCommandMessage(interaction: CommandInteraction): Promise<void> {
        interaction.channel.send(interaction.options.get("input").value as string);
        await interaction.reply({content: "OK!", ephemeral: true});
    }

    private async slashCommandEmbed(interaction: CommandInteraction): Promise<void> {
        let jsonString: string = interaction.options.getString("json", true) as string;
        console.log(jsonString);
        let json: {} = JSON.parse(jsonString);
        interaction.channel.send({
            embeds: [
                json
            ]
        }).catch(reason => {
            BotLogger.Warn(reason);
        });
        await interaction.reply({
            content: "OK!",
            ephemeral: true
        });
    }

    private async behaviorTemplate(interaction: ButtonInteractionWrap, args: string[]): Promise<void> {
        await interaction.interaction.deferUpdate();
    }

    private async behaviorSetRole(interaction: ButtonInteractionWrap, args: string[]): Promise<void> {
        if (args.length !== 1) {
            return;
        }

        let roleId: string = args[0];
        let role: Role | null = await Roles.GetRole(roleId);
        if (role === null) {
            await interaction.interaction.reply({
                content: `Role ${roleId} neexistuje. Obrať se prosím na administratora.`,
                ephemeral: true
            });
            return;
        }

        if (Roles.HasRole(interaction.caller, roleId)) {
            await Roles.RemoveRole(interaction.caller, roleId);
            await interaction.interaction.reply({content: `Byla ti odebrána role ${role.name}.`, ephemeral: true});
            return;
        }
        await Roles.AddRole(interaction.caller, roleId);
        await interaction.interaction.reply({content: `Byla ti přidána role ${role.name}.`, ephemeral: true});
    }

    private async behaviorSetPermission(interaction: ButtonInteractionWrap, args: string[]): Promise<void> {

    }

    private async behaviorSimpleResponse(interaction: ButtonInteractionWrap, args: string[]): Promise<void> {
        if (args.length !== 1) {
            return;
        }

        await interaction.message.channel.send(args[0]);
        await interaction.interaction.deferUpdate();
    }

    private async behaviorHiddenResponse(interaction: ButtonInteractionWrap, args: string[]): Promise<void> {
        if (args.length !== 1) {
            return;
        }

        await interaction.interaction.reply({content: args[0], ephemeral: true});
    }

    private async behaviorSimplePercentage(interaction: ButtonInteractionWrap, args: string[]): Promise<void> {
        if (args.length !== 1) {
            return;
        }

        let num: number = Math.round(Math.random() * 100);

        await interaction.message.channel.send(interaction.caller.toString() + " " + args[0] + ` ${num}%`);
        await interaction.interaction.deferUpdate();
    }
}