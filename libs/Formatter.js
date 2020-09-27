/**
 * User: Cloudy
 * Date: 23/03/2020
 * Time: 16:55
 */

/**
 * Formats text.
 * @param {string} string
 * @param {string[]} args
 * @return {string}
 */
exports.Format = (string, args) => {
    return exports.Format2(string, ["{", "}"], args);
};

exports.Format2 = (string, splitters, args) => {
    let idx0, idx1;
    while ((idx0 = string.indexOf(splitters[0])) >= 0 && (idx1 = string.indexOf(splitters[1])) >= 0 && idx1 > idx0) {
        let arg = string.substring(idx0 + splitters[0].length, idx1);
        let num = parseInt(arg);
        if (!isNaN(num)) {
            string = string.substring(0, idx0) + args[num] + string.substring(idx1 + splitters[1].length);
        }
    }
    return string;
};