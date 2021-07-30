/**
 * User: Cloudy
 * Date: 02/04/2020
 * Time: 23:37
 */

const Main = require("../main");
const Mailer = require("nodemailer");

let transporter = Mailer.createTransport({
    service: "gmail",
    auth: {
        user: Main.Auth.mail.user,
        pass: Main.Auth.mail.pass
    }
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

exports.Send = (to, subject, html) => {
    transporter.sendMail({
        from: Main.Auth.mail.user,
        to: to,
        subject: subject,
        html: html
    });
};