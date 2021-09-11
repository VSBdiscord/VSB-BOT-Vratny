/**
 * User: Bc. Milián Daniel
 * Date: 24/08/2021
 * Time: 19:26
 */
import {Service} from "../service";
import * as Main from "../main";
import * as Channels from "../libs/Channels";
import * as Formatter from "../libs/Formatter";
import * as axios from "axios";
// import * as cheerio from "cheerio";
import {TextChannel} from "discord.js";

export class PostingService extends Service {
    url: string;
    articlePrefixUrl: string;
    lastId: number;
    channel: TextChannel;

    constructor() {
        super();
        this.bot = Main.GetBot("postman");
        this.url = "https://www.vsb.cz/cs/o-univerzite/novinky/aktuality";
        this.articlePrefixUrl = "https://www.vsb.cz";
        this.lastId = 0;
        // this.RegisterLegacyCommand("news", (msg, args) => {this.fetchNews();});
        // this.RegisterCron('0 0 * * * *', () => {this.fetchNews();});
        this.channel = null;
    }

    async OnStart() {
        Channels.FetchChannel(Main.Config.channels.vsbNews).then(channel => {
            this.channel = channel as TextChannel;
            this.channel.messages.fetch({limit: 1}, {cache: true}).then(msgs => {
                if (msgs.size !== 1) return;
                let msg = msgs.first();
                let url = msg.content.substr(msg.content.indexOf("https://"));
                this.lastId = parseInt(url.substring(url.indexOf("?reportId=") + "?reportId=".length, url.indexOf("&")));
            });
        });
    }

    /**
     * Reads activity vsb page and reads the latest news.
     */
    // fetchNews() {
    //     axios.default(this.url).then(response => {
    //         this.Enforce();
    //
    //         const html = response.data;
    //         const $ = cheerio.load(html);
    //
    //         let element = $(".tile").first();
    //         let id = parseInt(element.attr("class").substring("tile info_".length));
    //
    //         if (this.lastId !== id) {
    //             this.lastId = id;
    //             let title = element.find(".tile-headline").first().text();
    //             this.channel.send(Formatter.Format(Main.Messages.newsText, [title, this.articlePrefixUrl + element.attr("href")]));
    //
    //         }
    //     }).catch(console.error);
    // }
}