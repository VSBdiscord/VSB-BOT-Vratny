/**
 * User: Bc. Milián Daniel
 * Date: 11/09/2021
 * Time: 19:18
 */

/**
 *
 */
export abstract class MasterServerDataBuilder {
    public static readonly registerInfoId: number = 0;
    public static readonly botVerifyStudentId: number = 1;

    public static Acknowledge(infoId: number): Buffer {
        let buffer: Buffer = Buffer.alloc(2);
        buffer.writeUInt8(infoId, 0);
        buffer.writeUInt8(255, 1);
        return buffer;
    }

    public static IsAcknowledge(buffer: Buffer, infoId: number): boolean {
        return buffer.length === 2 && buffer.readUInt8(0) === infoId && buffer.readUInt8(1) === 255;
    }

    /**
     *
     * @param appId
     */
    public static RegisterApp(appId: number): Buffer {
        let buffer: Buffer = Buffer.alloc(2);
        buffer.writeUInt8(this.registerInfoId, 0);
        buffer.writeUInt8(appId, 1);
        return buffer;
    }

    public static BotVerifyStudent(userId: string, login: string, mail: string, firstName: string, lastName: string): Buffer {
        // let userIdBuffer: Buffer = Buffer.from(userId);
        // let loginBuffer: Buffer = Buffer.from(login);
        // let mailBuffer: Buffer = Buffer.from(mail);
        // let firstNameBuffer: Buffer = Buffer.from(firstName);
        // let lastNameBuffer: Buffer = Buffer.from(lastName);

        // let buffer: Buffer = Buffer.allocUnsafe(1 + userIdBuffer.length + loginBuffer.length + mailBuffer.length + firstNameBuffer.length + lastNameBuffer.length + 5);
        // return Buffer.concat([
        //     Buffer.from([this.botVerifyStudentId]),
        //     Buffer.from([userIdBuffer.length]),
        //     userIdBuffer,
        //     Buffer.from([loginBuffer.length]),
        //     loginBuffer,
        //     Buffer.from([mailBuffer.length]),
        //     mailBuffer,
        //     Buffer.from([firstNameBuffer.length]),
        //     firstNameBuffer,
        //     Buffer.from([lastNameBuffer.length]),
        //     lastNameBuffer
        // ]);

        let buffer: Buffer = Buffer.from(JSON.stringify({
            "userId": userId,
            "login": login,
            "mail": mail,
            "firstName": firstName,
            "lastName": lastName
        }));
        return Buffer.concat([
            Buffer.from([this.botVerifyStudentId]),
            buffer
        ]);

        // TODO: NodeJS Buffers are retarded and incomplete. Probably will change to JSON string instead, idc anymore... (Chce se mi srát. :>)

        // let buffer: Buffer = Buffer.alloc(1 + userId.length + login.length + mail.length + firstName.length + lastName.length);
        // Buffer.from()
        // buffer.writeUInt8(this.botVerifyStudentId, 0);
        // buffer.writeUInt8(userId.length, 1);
        // buffer.write(userId);
        // buffer.writeUInt8(login.length, 1 + userId.length);
        // buffer.write(login);
        // buffer.writeUInt8(mail.length, 1 + 1 + userId.length + login.length);
        // buffer.write(mail);
        // buffer.writeUInt8(firstName.length, 1 + 1 + 1 + userId.length + login.length + mail.length);
        // buffer.write(firstName);
        // buffer.writeUInt8(lastName.length, 1 + 1 + 1 + 1 + userId.length + login.length + mail.length + firstName.length);
        // buffer.write(lastName);
        // return buffer;
    }
}