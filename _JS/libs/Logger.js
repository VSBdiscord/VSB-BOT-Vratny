/**
 * User: Cloudy
 * Date: 22/03/2020
 * Time: 22:34
 */

let prefixSpace = 20;

let prefix = (tag) => {
    let date = new Date();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    let string = date.getHours() + ":" + minutes + ":" + seconds;
    for (let i = string.length; i < prefixSpace; ++i) {
        string += " ";
    }
    return string + " [" + tag + "] ";
};

/**
 * Sends INFO log.
 * @param {string} message
 */
exports.Info = (message) => {
    console.log(prefix("INFO") + message);
};

/**
 * Sends ERROR log.
 * @param {string} message
 */
exports.Error = (message) => {
    console.error(prefix("ERROR") + message);
};