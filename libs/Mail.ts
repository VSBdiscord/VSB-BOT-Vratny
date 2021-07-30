/**
 * User: Bc. Milián Daniel
 * Date: 07/08/2021
 * Time: 20:19
 */

// TODO: FINISH...

import * as Main from "../main";
import * as Mailer from "nodemailer";

let transporter = Mailer.createTransport({
    service: "gmail",
    auth: {
        user: Main.Auth.mail.user,
        pass: Main.Auth.mail.pass
    }
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export function Send(to:string, subject:string, html:string) {
    transporter.sendMail({
        from: Main.Auth.mail.user,
        to: to,
        subject: subject,
        html: html
    });
}