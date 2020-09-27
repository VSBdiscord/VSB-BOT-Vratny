/**
 * User: Cloudy
 * Date: 23/03/2020
 * Time: 16:50
 */

const Main = require("../main");

let fetchesChannels = [];

/**
 * Returns channel by id.
 * @param {string} id
 * @return {GuildChannel}
 */
exports.GetChannel = (id) => {
    return Main.GetCurrentBot().guild.channels.cache.find(channel => channel.id === id);
};

/**
 * Fetches channel by id.
 * @param {string} id
 * @return {Promise}
 */
exports.FetchChannel = (id) => {
    if (fetchesChannels.indexOf(id) !== -1) return new Promise((res, err) => {
        res(exports.GetChannel(id));
    });
    return Main.GetCurrentBot().client.channels.fetch(id, true);
};