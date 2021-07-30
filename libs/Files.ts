/**
 * User: Bc. Milián Daniel
 * Date: 07/08/2021
 * Time: 20:15
 */

import * as FileSystem from "fs";

export function ReadFile(path: string) {
    return FileSystem.readFileSync(path, "utf8");
}