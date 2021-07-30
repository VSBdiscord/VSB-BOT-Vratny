/**
 * User: Cloudy
 * Date: 23/03/2020
 * Time: 02:00
 */

const Main = require("../main");

/**
 * Checks if user has role.
 * @param {GuildMember} member
 * @param {string} id
 */
exports.HasRole = (member, id) => {
    if (member === null || member === undefined) return false;
    return member.roles.cache.find(role => role.id === id) !== undefined;
};

/**
 * Adds role to specified member.
 * @param {GuildMember} member
 * @param {string} id
 * @return {Promise<GuildMember>}
 */
exports.AddRole = (member, id) => {
    return member.roles.add(this.GetRole(id));
};

/**
 * Returns role by id.
 * @param {string} id
 * @return {Role}
 */
exports.GetRole = (id) => {
    return Main.GetCurrentBot().guild.roles.cache.find(role => role.id === id);
};

/**
 * Removes role from specified member.
 * @param {GuildMember} member
 * @param {string} id
 * @return {Promise<GuildMember>}
 */
exports.RemoveRole = (member, id) => {
    return member.roles.remove(this.GetRole(id));
};