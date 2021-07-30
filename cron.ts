/**
 * User: Bc. Milián Daniel
 * Date: 27/07/2021
 * Time: 18:38
 */

import * as CronJob from "cron";

export class Cron {
    cron:CronJob.CronJob;

    constructor(cronString: string, callback:()=>void) {
        this.cron = new CronJob.CronJob(cronString, callback, null, true, "Europe/Prague");
    }

    public Stop():void {
        this.cron.stop();
    }
}