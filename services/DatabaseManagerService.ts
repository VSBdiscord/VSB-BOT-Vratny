/**
 * User: Bc. Milián Daniel
 * Date: 24/08/2021
 * Time: 19:47
 */
import {Service} from "../service";
import * as Main from "../main";

export class DatabaseManagerService extends Service {
    activated: boolean;

    constructor() {
        super();
        this.bot = Main.GetBot("porter");

        this.activated = false;
        // this.RegisterLegacyCommand(
        //     "dbmgr",
        //     this.dbmgr,
        //     {
        //         "requiredRole": Main.Config.roles.developerRole
        //     }
        // );
    }

    dbmgr(msg, args) {
        if (!this.activated) {
            this.onActivate(args);
            this.activated = true;
            return;
        }

        this.onDeactivate(args);
        this.activated = false;
    }

    onActivate(args) {

    }

    onDeactivate(args) {

    }
}