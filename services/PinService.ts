/**
 * User: Bc. Milián Daniel
 * Date: 24/08/2021
 * Time: 19:11
 */
import {Service} from "../service";
import * as Main from "../main";
import {GuildMember, MessageReaction} from "discord.js";

export class PinService extends Service {
    constructor() {
        super();
        this.bot = Main.GetBot('porter');
    }

    async OnReactionAdd(reaction: MessageReaction, guildMember: GuildMember) {
        if (reaction.emoji.name === '📌' && reaction.count > 7) {
            await reaction.message.pin();
        }
        return true;
    }
}