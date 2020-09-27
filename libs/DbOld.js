/**
 * User: Cloudy
 * Date: 22/03/2020
 * Time: 22:04
 */

let config = require("../config");
let Logger = require("./Logger");
let sqlite3 = require("sqlite3").verbose();
let DB = new sqlite3.Database(config.database.addr, (err) => {
    if (err) {
        Logger.Error("Failed to connect to the Local DB. (" + err.message + ")");
        return;
    }
    Logger.Info("Connected to the Local DB.");
});

/**
 * Executes query and selects all results.
 * @param {string} query
 * @param {string[]} params
 * @return {Promise}
 */
exports.Select = (query, params) => {
    return new Promise((resolve, reject) => {
        DB.serialize(() => {
            DB.all(query, params, (err, rows) => {
                if (err) {
                    Logger.Error("Query Error. (" + err.message + ")");
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    });
};

/**
 * Executes query without any result.
 * @param {string} query
 * @param {string[]} params
 */
exports.Run = (query, params) => {
    DB.run(query, params, (err) => {
        if (err) {
            Logger.Error("Query Error. (" + err.message + ")");
        }
    });
};