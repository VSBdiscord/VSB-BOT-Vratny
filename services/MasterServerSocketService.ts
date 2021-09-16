/**
 * User: Bc. Milián Daniel
 * Date: 11/09/2021
 * Time: 18:39
 */
import {NonBotService, Service} from "../service";
import * as Net from "net";
import * as Logger from "../libs/Logger";
import * as Services from "../libs/Services";
import {MasterServerDataBuilder} from "../libs/MasterServerDataBuilder";
import {VerificationService} from "./VerificationService";
import {BotLogger} from "../libs/BotLogger";

export class MasterServerSocketService extends NonBotService {
    client: Net.Socket = undefined;

    constructor() {
        super();
    }

    async OnStart(): Promise<void> {
        this.createSocket();
    }

    private createSocket(): void {
        Logger.Info("Connecting to MasterServer.");
        this.client = new Net.Socket();
        this.client.connect(756, "127.0.0.1", () => {
            Logger.Info("MasterServer connection opened.");
            this.client.write(MasterServerDataBuilder.RegisterApp(0)); // MasterServer Register information
        });
        this.client.on("data", (data: Buffer) => {
            if (MasterServerDataBuilder.IsAcknowledge(data, MasterServerDataBuilder.registerInfoId)) {
                Logger.Info("MasterServer app registered successfully.");
                return;
            }
            let infoId = data.readUInt8(0);
            if (infoId === MasterServerDataBuilder.botVerifyStudentId) {
                let studentData: {} = JSON.parse(data.slice(1, data.length).toString());
                Services.GetService(VerificationService).VerifyStudent(
                    studentData["userId"],
                    studentData["mail"],
                    studentData["login"],
                    studentData["firstName"],
                    studentData["lastName"]
                ).finally();
            }
        });
        this.client.on("error", err => {
            BotLogger.Error(err, "An error occurred in MasterServerSocket:").finally();
        });
    }
}