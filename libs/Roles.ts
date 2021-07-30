/**
 * User: Bc. Milián Daniel
 * Date: 07/08/2021
 * Time: 20:34
 */

import * as Main from "../main";
import {GuildMember, Role} from "discord.js";

/**
 *
 * @param member
 * @param id
 * @constructor
 */
export function HasRole(member:GuildMember, id:string):boolean {
    if (member == null) return false;
    return member.roles.cache.find(role => role.id == id) != null;
}

/**
 *
 * @param member
 * @param id
 * @constructor
 */
export function AddRole(member:GuildMember, id:string):Promise<GuildMember> {
    return member.roles.add(this.GetRole(id));
}

/**
 *
 * @param id
 * @constructor
 */
export function GetRole(id:string):Role {
    return Main.GetCurrentBot().guild.roles.cache.find(role => role.id === id);
}

/**
 *
 * @param member
 * @param id
 * @constructor
 */
export function RemoveRole(member:GuildMember, id:string):Promise<GuildMember> {
    return member.roles.remove(this.GetRole(id));
}