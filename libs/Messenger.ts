/**
 * User: Bc. Milián Daniel
 * Date: 07/08/2021
 * Time: 20:21
 */

import * as Main from "../main";
import {GuildChannel, GuildMember, Message, Role, TextChannel, ThreadChannel} from "discord.js";
import {mem} from "systeminformation";

/**
 *
 * @param message
 * @param seconds
 * @constructor
 */
export function DeleteAfter(message: Message, seconds: number) {
    setTimeout(() => {
        message.delete().finally();
    }, seconds * 1000);
}

/**
 *
 * @param member
 * @constructor
 */
export function GetName(member: GuildMember): string {
    return member.nickname !== null && member.nickname !== undefined ? member.nickname : member.user.username;
}

/**
 *
 * @param member
 */
export function GetDetailedName(member: GuildMember): string {
    if (member.nickname !== null && member.nickname !== undefined) {
        return `${member.nickname} (${member.user.tag})`;
    }
    return `${member.user.tag}`;
}

/**
 *
 * @param member
 */
export function GetMemberRoles(member: GuildMember): Role[] {
    // Probably not working?
    return Array.from(member.roles.cache.filter(role => role.name !== "@everyone").values());
}

/**
 *
 */
export function GetMembersWithoutRole(): GuildMember[] {
    // Probably not working?
    return Array.from(Main.GetCurrentBot().guild.members.cache.filter(member => GetMemberRoles(member).length === 0).values());
}

/**
 *
 * @param id
 * @constructor
 */
export function GetMemberById(id: string): Promise<GuildMember> {
    // return Main.GetCurrentBot().guild.members.fetch(id).then(member => {
    //     return member;
    // });
    return Main.GetCurrentBot().guild.members.fetch({user: id, cache: true});
}

/**
 *
 * @param channelId
 * @param messageId
 * @constructor
 */
export function GetMessageById(channelId: string, messageId: string): Promise<Message> {
    let channel: TextChannel = Main.GetCurrentBot().guild.channels.cache.find((channel) => channel.id === channelId) as TextChannel;
    if (channel === null) {
        return new Promise(((resolve, reject) => {
            Main.GetCurrentBot().client.channels.fetch(channelId).then((channel: TextChannel) => {
                channel.messages.fetch(messageId, {cache: true}).then((msg: Message) => {
                    resolve(msg);
                }).catch(() => {
                    reject();
                });
            }).catch(() => {
                reject();
            });
        }));
    } else {
        return (
            Main.GetCurrentBot()
                .guild
                .channels
                .cache
                .find((channel) => channel.id == channelId) as TextChannel
        ).messages
            .fetch(messageId, {cache: true});
    }
}