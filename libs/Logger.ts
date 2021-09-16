/**
 * User: Bc. Milián Daniel
 * Date: 07/08/2021
 * Time: 20:11
 */

let prefixSpace: number = 20;

function prefix(tag: string) {
    let date: Date = new Date();
    let minutes: number = date.getMinutes();
    let seconds: number = date.getSeconds();
    let minutesStr: string = minutes.toString();
    let secondsStr: string = seconds.toString();
    if (minutes < 10) minutesStr = "0" + minutesStr;
    if (seconds < 10) secondsStr = "0" + secondsStr;
    let string = date.getHours().toString() + ":" + minutesStr + ":" + secondsStr;
    for (let i = string.length; i < prefixSpace; ++i) {
        string += " ";
    }
    return string + " [" + tag + "] ";
}

/**
 * Sends INFO log.
 * @param message
 */
export function Info(message: string) {
    console.log(prefix("INFO") + message);
}

/**
 * Sends ERROR log.
 * @param message
 */
export function Error(message: string) {
    console.error(prefix("ERROR") + message);
}

export function Obj(obj: any) {
    console.log(prefix("OBJ") + obj);
}