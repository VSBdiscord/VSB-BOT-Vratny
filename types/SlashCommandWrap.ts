/**
 * User: Bc. Milián Daniel
 * Date: 13/09/2021
 * Time: 04:05
 */

import {SlashCommandBuilder} from "@discordjs/builders";
import {CommandInteraction} from "discord.js";

export type CommandBehaviorCallback =
    ((commandInteraction: CommandInteraction) => void)
    | ((commandInteraction: CommandInteraction) => Promise<void>);

export class SlashCommandWrap {
    public readonly builder: SlashCommandBuilder;
    public readonly callback: CommandBehaviorCallback;
    public readonly roles: string[] | null;

    constructor(builder: SlashCommandBuilder, callback: CommandBehaviorCallback, roles: string[] | null) {
        this.builder = builder;
        this.callback = callback;
        this.roles = roles;
    }
}