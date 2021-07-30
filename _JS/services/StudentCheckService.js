const Service = require("../service");
const Main = require("../main");

/**
 * @author DM
 */
class StudentCheckService extends Service {
    constructor() {
        super();
        this.bot = Main.GetBot("porter");
    }

    async OnStart() {
        [...Main.GetCurrentBot().client.members.cache.values()].forEach(member => {
            let isStudent = false;
            let hasStudentRole = false;
            [...member.roles.cache.values()].forEach(role => {
                if (Main.Config.roles.classes.includes(role.id)) isStudent = true;
                if (role.id === Main.Config.roles.studentRole) hasStudentRole = true;
            });
            if (isStudent && !hasStudentRole) {
                member.roles.add(Main.Config.roles.studentRole, "Student Check Service");
            }
        });
    }
}

module.exports = StudentCheckService;