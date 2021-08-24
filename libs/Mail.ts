/**
 * User: Bc. Milián Daniel
 * Date: 07/08/2021
 * Time: 20:19
 */

// TODO: FINISH...

import * as Main from "../main";
import * as Mailer from "nodemailer";
import {Auth} from "../main";

// let transporter = Mailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: Main.Auth.mail.user,
//         pass: Main.Auth.mail.pass
//     }
// });

let login: {} = {
    host: Main.Auth.mail.host,
    port: Main.Auth.mail.port,
    secure: Main.Auth.mail.port === 465,
    auth: {
        user: Main.Auth.mail.user,
        pass: Main.Auth.mail.pass
    }
};

let transporter = Mailer.createTransport(login);

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function Send(to: string, subject: string, html: string) {
    await transporter.sendMail({
        from: Main.Auth.mail.user,
        to: to,
        subject: subject,
        html: html
    });
}