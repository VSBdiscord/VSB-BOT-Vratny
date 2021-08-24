/**
 * User: Bc. Milián Daniel
 * Date: 07/08/2021
 * Time: 20:21
 */

import * as Main from "../main";
import {GuildChannel, GuildMember, Message, Role, TextChannel} from "discord.js";

/**
 *
 * @param message
 * @param seconds
 * @constructor
 */
export function DeleteAfter(message: Message, seconds: number) {
    setTimeout(() => {
        message.delete();
    }, seconds * 1000);
}

/**
 *
 * @param member
 * @constructor
 */
export function GetName(member:GuildMember):string {
    return member.nickname !== null && member.nickname !== undefined ? member.nickname : member.user.username;
}

/**
 *
 * @param member
 * @constructor
 */
export function GetMemberRoles(member:GuildMember):Role[] {
    return member.roles.cache.filter(role => role.name !== "@everyone").array();
}

/**
 *
 * @constructor
 */
export function GetMembersWithoutRole():GuildMember[] {
    return Main.GetCurrentBot().guild.members.cache.filter(member => GetMemberRoles(member).length === 0).array();
}

/**
 *
 * @param id
 * @constructor
 */
export function GetMemberById(id:string):Promise<GuildMember> {
    // return Main.GetCurrentBot().guild.members.fetch(id).then(member => {
    //     return member;
    // });
    return Main.GetCurrentBot().guild.members.fetch(id);
}

/**
 *
 * @param channelId
 * @param messageId
 * @constructor
 */
export function GetMessageById(channelId:string, messageId:string):Promise<Message> {
    let channel:GuildChannel = Main.GetCurrentBot().guild.channels.cache.find((channel:GuildChannel) => channel.id === channelId);
    if (channel == null) {
        return new Promise(((resolve, reject) => {
            Main.GetCurrentBot().client.channels.fetch(channelId).then((channel:TextChannel) => {
                channel.messages.fetch(messageId, true).then((msg:Message) => {
                    resolve(msg);
                }).catch(() => {reject();});
            }).catch(() => {reject();});
        }));
    } else {
        return (Main.GetCurrentBot()
            .guild
            .channels
            .cache
            .find((channel:GuildChannel) => channel.id == channelId) as TextChannel)
            .messages
            .fetch(messageId, true);
    }
}