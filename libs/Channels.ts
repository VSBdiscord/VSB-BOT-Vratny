/**
 * User: Bc. Milián Daniel
 * Date: 27/07/2021
 * Time: 23:55
 */

import * as Main from "../main";
import {Channel, TextChannel} from "discord.js";

let fetchedChannels: string[] = [];

/**
 * Returns channel by id.
 * @param id
 * @return channel
 */
export function GetChannel(id: string): TextChannel {
    return Main.GetCurrentBot().guild.channels.cache.find(channel => channel.id == id) as TextChannel;
}

/**
 * Fetches channel by id.
 * @param id
 * @return channel promise
 */
export async function FetchChannel(id: string): Promise<Channel> {
    if (fetchedChannels.indexOf(id) != -1) return new Promise((res, err) => {
        res(GetChannel(id));
    });
    return Main.GetCurrentBot().client.channels.fetch(id, {cache: true});
}