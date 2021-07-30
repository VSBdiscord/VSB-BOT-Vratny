/**
 * User: Cloudy
 * Date: 02/04/2020
 * Time: 16:54
 */

const Logger = require("./libs/Logger");
const Package = require("../package.json")

// Not finished and used currently.
let targetVersion = "1.1.2";
Logger.Info("Migration for version " + targetVersion);
if (Package.version !== targetVersion) {
    Logger.Error("Migration failed. [Current Version = " + Package.version + ", Target Version = " + targetVersion + "]");
    return;
}
