const CASAuthentication = require("node-cas-authentication");
// import * as CASAuthentication from "node-cas-authentication";
const Auth = require("./auth.json");
import * as Express from "express";

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
    return_to: 'https://127.0.0.1:8080/success/'
});

Express().listen(8080, () => {
    console.log("HTTP Server on port 8080 is active.");
});