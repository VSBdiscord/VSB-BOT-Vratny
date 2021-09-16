/**
 * User: Bc. Milián Daniel
 * Date: 28/07/2021
 * Time: 00:04
 */

import * as Main from "../main";
import * as MySQL from "mysql";
import * as Logger from "./Logger";
import {BotLogger} from "./BotLogger";

let connection: MySQL.Connection = null;

function setupConnection() {
    if (connection === null) connection = MySQL.createConnection({
        host: Main.Auth.database.host,
        user: Main.Auth.database.user,
        password: Main.Auth.database.pass,
        database: Main.Auth.database.db,
        port: Main.Auth.database.port,
        timezone: "Europe/Prague",
        charset: "utf8mb4"
    });

    connection.on("error", err => {
        BotLogger.Error(err).finally();
    })
    connection.connect(err => {
        if (err) BotLogger.Error(err).finally();
    });
}

let prepared: boolean = false;
let closeTimeout: NodeJS.Timeout = null;

/**
 * Prepares db server.
 * @param callback
 */
export function Prepare(callback: () => void) {
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
}

/**
 * Executes query and selects all results.
 * @param query
 * @param params
 * @constructor
 */
export function Select(query: string, params: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
        let func = () => {
            connection.query(query, params, (error, results, fields) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results);
            });
        };

        if (!prepared) {
            Prepare(func);
            return;
        }
        func();
    });
}

/**
 * Executes query without any result.
 * @param query
 * @param params
 * @constructor
 */
export function Run(query: string, params: any[]): void {
    let func = () => {
        connection.query(query, params, (error) => {
            if (error) BotLogger.Error(error).finally();
        });
    };

    if (!prepared) {
        Prepare(func);
        return;
    }
    func();
}