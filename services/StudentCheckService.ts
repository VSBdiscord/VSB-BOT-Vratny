/**
 * User: Bc. Milián Daniel
 * Date: 24/08/2021
 * Time: 19:30
 */
import {Service} from "../service";
import * as Main from "../main";
import {GuildMember, Role} from "discord.js";

export class StudentCheckService extends Service {
    constructor() {
        super();
        this.bot = Main.GetBot("porter");
    }

    async OnStart() {
        Main.GetCurrentBot().guild.members.cache.forEach((member: GuildMember) => {
            let isStudent = false;
            let hasStudentRole = false;
            member.roles.cache.forEach((role: Role) => {
                if (Main.Config.roles.classes.includes(role.id)) isStudent = true;
                if (role.id === Main.Config.roles.studentRole) hasStudentRole = true;
            });
            if (isStudent && !hasStudentRole) {
                member.roles.add(Main.Config.roles.studentRole, "Student Check ServiceComponent");
            }
        });
    }
}