/**
 * User: Bc. Milián Daniel
 * Date: 27/07/2021
 * Time: 17:54
 */

const Service = require("../service");
const Main = require("../main");

class DatabaseManagerService extends Service {
    constructor() {
        super();
        this.bot = Main.GetBot("porter");

        this.activated = false;
        this.RegisterCommand(
            "dbmgr",
            this.dbmgr,
            {
                "requiredRole": Main.Config.roles.developerRole
            }
        );
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

module.exports = DatabaseManagerService;