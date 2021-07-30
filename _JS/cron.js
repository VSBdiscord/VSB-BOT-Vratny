/**
 * User: Cloudy
 * Date: 26/03/2020
 * Time: 18:18
 */

const CronJob = require("cron").CronJob;

/**
 * @author DM
 */
class Cron {
    constructor(cronString, callback) {
        this.cron = new CronJob(cronString, () => {
            callback();
        }, null, true, "Europe/Prague");
    }

    Stop() {
        this.cron.stop();
    }
}

module.exports = Cron;