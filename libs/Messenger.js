/**
 * User: Cloudy
 * Date: 23/03/2020
 * Time: 02:14
 */

const Main = require("../main");

/**
 * Deletes message after specified time.
 * @param {Message} message
 * @param {int} seconds
 */
exports.DeleteAfter = (message, seconds) => {
    setTimeout(() => {
        message.delete();
    }, seconds * 1000);
};

/**
 * Returns nickname or name of member.
 * @param {GuildMember} member
 * @return {string}
 */
exports.GetName = (member) => {
    return member.nickname !== null && member.nickname !== undefined ? member.nickname : member.user.username;
};

/**
 * @param {GuildMember} member
 * @return {Role[]}
 */
exports.GetMemberRoles = (member) => {
    return member.roles.cache.filter(role => role.name !== "@everyone").array();
};

/**
 * Returns all members without role
 * @return {GuildMember[]}
 */
exports.GetMembersWithoutRole = () => {
    let obj = this;
    return Main.GetCurrentBot().guild.members.cache.filter(member => obj.GetMemberRoles(member).length === 0).array();
};

/**
 * Gets member by id.
 * @param {string} id
 * @return {?GuildMember}
 */
exports.GetMemberById = (id) => {
    return Main.GetCurrentBot().guild.members.cache.find(member => member.id === id);
};

/**
 * Returns message by id.
 * @param {string} channelId
 * @param {string} messageId
 * @return {Message}
 */
exports.GetMessageById = (channelId, messageId) => {
    return Main.GetCurrentBot()
               .guild
               .channels
               .cache
               .find(channel => channel.id === channelId)
               .messages
               .fetch(messageId, true);
};