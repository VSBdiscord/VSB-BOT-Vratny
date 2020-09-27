/**
 * User: Cloudy
 * Date: 19/05/2020
 * Time: 23:25
 */

let fs = require("fs");

/**
 *
 * @param {string} path
 * @return {string}
 */
exports.ReadFile = (path) => {
    return fs.readFileSync(path, "utf8");
};