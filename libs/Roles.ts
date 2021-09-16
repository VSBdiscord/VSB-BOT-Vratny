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
export function HasRole(member: GuildMember, id: string): boolean {
    if (member == null) return false;
    return member.roles.cache.find(role => role.id == id) != null;
}

/**
 *
 * @param member
 * @param id
 * @constructor
 */
export async function AddRole(member: GuildMember, id: string): Promise<GuildMember> {
    return member.roles.add(await GetRole(id));
}

/**
 *
 * @param id
 * @constructor
 */
export async function GetRole(id: string): Promise<Role | null> {
    let role: Role | undefined = Main.GetCurrentBot().guild.roles.cache.find(role => role.id === id);
    if (role !== undefined) {
        return role;
    }
    return await Main.GetCurrentBot().guild.roles.fetch(id, {cache: true});
}

/**
 *
 * @param member
 * @param id
 * @constructor
 */
export async function RemoveRole(member: GuildMember, id: string): Promise<GuildMember> {
    return member.roles.remove(await GetRole(id));
}