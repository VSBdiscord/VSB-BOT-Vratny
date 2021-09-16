import {MasterServerDataBuilder} from "./libs/MasterServerDataBuilder";
import * as Auth from "./auth.json";
import * as Express from "express";
import * as ExpressSession from "express-session";
import * as Net from "net";
import {BidirectionalMap} from "./types/BidirectionalMap";
import * as Logger from "./libs/Logger";

const CASAuthentication = require("node-cas-authentication");

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

let socketApps: BidirectionalMap<Net.Socket, number> = new BidirectionalMap<Net.Socket, number>();

let masterServer: Net.Server = Net.createServer();
masterServer.on("connection", (socket: Net.Socket) => {
    Logger.Info("New MasterServer connection.");

    socket.on("data", (data: Buffer) => {
        let infoId = data.readUInt8(0);

        if (infoId === MasterServerDataBuilder.registerInfoId) {
            // Register appId
            let appId: number = data.readUInt8(1);
            socketApps.set(socket, appId);
            Logger.Info(`Connection appId set to ${appId}.`);
            socket.write(MasterServerDataBuilder.Acknowledge(infoId));
        }
    });
    socket.on("close", () => {
        if (!socketApps.hasKey(socket)) {
            return;
        }

        Logger.Info(`Connection appId ${socketApps.get(socket)} disconnected.`);
        socketApps.deleteKey(socket);
    });

    socket.on("error", err => {
        return;
    });
})
masterServer.listen(756);
Logger.Info("MasterServer on port 756 is active.")

app.use(ExpressSession({
    secret: Auth.sso.secret,
    resave: false,
    saveUninitialized: true
}));

app.listen(80, () => {
    Logger.Info("HTTP Server on port 80 is active.");
});

app.get("/", (req, res) => {
    if (req.query["_"] === undefined) {
        res.send("NOT OK.");
        return;
    }

    req.session["userId"] = req.query["_"] as string;
    res.redirect("/auth");
});

app.get("/auth", cas.bounce, (req, res) => {
    if (req.session["cas_userinfo"] === undefined || req.session["userId"] === undefined) {
        res.send("An error occurred while obtaining session data.");
        return;
    }
    Logger.Obj(req.session);
    let userData: {} = req.session["cas_userinfo"] as {};
    let userId: string = req.session["userId"] as string;
    socketApps.val(0)?.write(MasterServerDataBuilder.BotVerifyStudent(
        userId,
        userData["uid"],
        userData["email"],
        userData["firstname"],
        userData["lastname"]
    ));
    res.send("OK.");
});