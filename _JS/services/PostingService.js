/**
 * User: Cloudy, MP
 * Date: 26/03/2020
 * Time: 22:58
 */

const Service = require("../service");
const Main = require("../main");
const Channels = require("../libs/Channels");
const axios = require("axios");
const Formatter = require("../libs/Formatter");
const cheerio = require("cheerio");

class PostingService extends Service {
    constructor() {
        super();
        this.bot = Main.GetBot("postman");
        this.url = "https://www.vsb.cz/cs/o-univerzite/novinky/aktuality";
        this.articlePrefixUrl = "https://www.vsb.cz";
        this.lastId = 0;
        this.RegisterCommand("news", (msg, args) => {this.fetchNews();});
        this.RegisterCron('0 0 * * * *', () => {this.fetchNews();});
        this.channel = null;
    }

    async OnStart() {
        Channels.FetchChannel(Main.Config.channels.vsbNews).then(channel => {
            this.channel = channel;
            this.channel.messages.fetch({limit: 1}, true).then(msgs => {
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
    fetchNews() {
        axios(this.url).then(response => {
            this.Enforce();

            const html = response.data;
            const $ = cheerio.load(html);

            let element = $(".tile").first();
            let id = parseInt(element.attr("class").substring("tile info_".length));

            if (this.lastId !== id) {
                this.lastId = id;
                let title = element.find(".tile-headline").first().text();
                this.channel.send(Formatter.Format(Main.Messages.newsText, [title, this.articlePrefixUrl + element.attr("href")]));

            }
        }).catch(console.error);
    }
}

module.exports = PostingService;