/**
 * User: Bc. Milián Daniel
 * Date: 07/08/2021
 * Time: 20:16
 */

/**
 * Formats text.
 * @param string
 * @param args
 * @return Formatted string
 */
export function Format(string: string, args: string[]): string {
    return Format2(string, ["{", "}"], args);
}

export function Format2(string: string, splitters: string[], args: string[]): string {
    let idx0: number;
    let idx1: number;
    while ((idx0 = string.indexOf(splitters[0])) >= 0 && (idx1 = string.indexOf(splitters[1])) >= 0 && idx1 > idx0) {
        let arg = string.substring(idx0 + splitters[0].length, idx1);
        let num = parseInt(arg);
        if (!isNaN(num)) {
            string = string.substring(0, idx0) + args[num] + string.substring(idx1 + splitters[1].length);
        }
    }
    return string;
}

/**
 *
 * @param string
 */
export function Simplify(string: string): string {
    return string.toLowerCase().trim()
        .replace(" ", "")
        .replace("<", "")
        .replace(">", "")
        .replace(":", "");
}