const CASAuthentication = require("node-cas-authentication");
import * as Auth from "./auth.json";
// const session = require("express-session");
import * as Express from "express";
import * as ExpressSession from "express-session";

const app = Express();

let cas = new CASAuthentication({
    cas_url: Auth.sso.targetUrl,
    service_url: Auth.sso.url,
    cas_version: '3.0',
    renew: false,
    is_dev_mode: false,
    dev_mode_user: '',
    dev_mode_info: {},
    session_name: 'cas_user',
    session_info: 'cas_userinfo',
    destroy_session: false,
});

app.use(ExpressSession({
    secret: 'test',
    resave: false,
    saveUninitialized: true
}));

app.listen(80, () => {
    console.log("HTTP Server on port 80 is active.");
});

app.get("/", (req, res) => {
    if (req.query["uid"] === undefined) {
        res.statusCode = 404;
        res.send(".");
        return;
    }

    let userId: string = req.query["uid"] as string;
    res.send("a");
});

app.get("/auth", cas.bounce, (req, res) => {
    console.log(req.session);
    res.send("OK");
});

// TODO: Save userid to session then redirect to auth and process.