/**
 * User: Bc. Milián Daniel
 * Date: 22/03/2020
 * Time: 22:04
 */

let Main = require("../main");
let Logger = require("./Logger");
let MySQL = require("mysql");

let connection = null;

let setupConnection = () => {
    if (connection === null) connection = MySQL.createConnection({
        host: Main.Auth.database.host,
        user: Main.Auth.database.user,
        password: Main.Auth.database.pass,
        database: Main.Auth.database.db,
        timezone: "Europe/Prague",
        charset: "utf8mb4"
    });

    connection.connect(err => {
        if (err) Logger.Error(err.message);
    });
};

let prepared = false;
let closeTimeout = null;

exports.Prepare = (callback) => {
    setupConnection();
    if (closeTimeout !== null)
        clearTimeout(closeTimeout);
    prepared = true;

    callback();

    closeTimeout = setTimeout(() => {
        connection.end();
        prepared = false;
        connection = null;
    }, 5000);
};

/**
 * Executes query and selects all results.
 * @param {string} query
 * @param {string[]} params
 * @return {Promise}
 */
exports.Select = (query, params) => {
    return new Promise((resolve, reject) => {
        let func = () => {
            connection.query(query, params, (error, results, fields) => {
                if (error) {
                    Logger.Error(error.message);
                    reject(error);
                    return;
                }
                resolve(results);
            });
        };

        if (!prepared) {
            this.Prepare(func);
            return;
        }
        func();
    });
};

/**
 * Executes query without any result.
 * @param {string} query
 * @param {string[]} params
 */
exports.Run = (query, params) => {
    let func = () => {
        connection.query(query, params, (error) => {
            if (error) Logger.Error(error.message);
        });
    };

    if (!prepared) {
        this.Prepare(func);
        return;
    }
    func();
};