/**
 * User: Bc. Milián Daniel
 * Date: 24/08/2021
 * Time: 19:12
 */
import {Service} from "../service";
import * as Moment from "moment";
import * as Main from "../main";
import * as Messenger from "../libs/Messenger";
import * as Channels from "../libs/Channels";
import {GuildEmoji, GuildMember, Message, TextChannel} from "discord.js";

export class PollService extends Service {
    votesHandled: PollVote[];

    constructor() {
        super();

        this.bot = Main.GetBot("porter");
        let data = {"requiredRole": Main.Config.roles.adminHelpRole};
        // this.RegisterLegacyCommand("vote", this.onVote, data);

        this.votesHandled = [];
    }

    onVote(msg, args) {
        if (args.length < 5 || (args.length - 3) % 2 !== 0) return false;
        let title = args[0];
        let type = parseInt(args[1]);
        let time = parseInt(args[2]);
        let totalOptions = (args.length - 3) / 2;
        let options = [];
        let emojis = [];
        for (let i = 0; i < totalOptions; ++i) {
            options.push(args[3 + i * 2]);
            emojis.push(args[3 + i * 2 + 1]);
        }
        let start = new Date();
        let end = new Date(start.getTime() + (time * 1000));
        this.votesHandled.push(new PollVote(null, msg.channel, type, title, start, end, options, emojis, msg.member));
        return true;
    }

    async OnStart() {
        await super.OnStart();
        let data: any[] = await Main.Database.Select(Main.Config.database.queries.select.polls, [])
        for (let i = 0; i < data.length; ++i) {
            let ids = data[i].id.split("-");
            this.votesHandled.push(new PollVote(ids[1], ids[0], data[i].type, data[i].title, new Date(data[i].start), new Date(data[i].end),
                JSON.parse(data[i].options), JSON.parse(data[i].emojis), await Messenger.GetMemberById(data[i].author)));
        }
    }

    /**
     * @param {MessageReaction} react
     * @return {PollVote}
     */
    getMsg(react) {
        for (let i = 0; i < this.votesHandled.length; ++i) {
            if (this.votesHandled[i].message === react.message) return this.votesHandled[i];
        }
        return null;
    }

    async OnReactionAdd(reaction, member) {
        let msg = this.getMsg(reaction);
        if (msg === null) return true;
        let date = new Date();
        if (date.getTime() >= msg.end.getTime()) return false;
        if (msg.type === 0) {
            let reactions = msg.message.reactions.cache.find(react => react.emoji.name !== reaction.emoji.name && react.users.cache.find(user => user.id === member.id) !== undefined);
            if (reactions !== undefined) {
                await reactions.users.remove(member.user);
            }
        }
        await msg.message.edit({embeds: [msg.createEmbed()]});
        return true;
    }

    async OnReactionRemove(reaction, member) {
        let msg = this.getMsg(reaction);
        if (msg === null) return;
        let date = new Date();
        if (date.getTime() >= msg.end.getTime()) return;
        await msg.message.edit({embeds: [msg.createEmbed()]});
    }
}

export class PollVote {
    type: number;
    title: string;
    start: Date;
    end: Date;
    options: string[];
    emojis: string[];
    realEmojis: (string | GuildEmoji)[];
    author: GuildMember;
    message: Message;
    channel: TextChannel;

    constructor(id, channel, type, title, start, end, options, emojis, author) {
        this.type = type;
        this.title = title;
        this.start = start;
        this.end = end;
        this.options = options;
        this.emojis = emojis;
        this.realEmojis = [];
        for (let i = 0; i < this.emojis.length; ++i) {
            let emoji: string | GuildEmoji = this.emojis[i];
            if (emoji.indexOf("<") !== -1 && emoji.indexOf(">") !== -1) {
                emoji = emoji.substring(emoji.lastIndexOf(":") + 1, emoji.lastIndexOf(">"));
                emoji = Main.GetCurrentBot().guild.emojis.cache.find(em => em.id === emoji);
            }
            this.realEmojis.push(emoji);
        }
        this.author = author;

        this.message = null;
        this.channel = channel;
        if (id === null) {
            this.createMessage();
        } else {
            Messenger.GetMessageById(channel, id).then((msg: Message) => {
                this.message = msg;
                this.message.reactions.cache.forEach(reaction => {
                    reaction.users.fetch().finally();
                });
            });
            this.channel = Channels.GetChannel(channel);
        }
    }

    createEmbed() {
        let text = "";
        for (let i = 0; i < this.options.length; ++i) {
            let num = 0;
            if (this.message !== null) {
                num = this.message.reactions.cache.find(react => (typeof this.realEmojis[i] === "string" && react.emoji.name === this.realEmojis[i]) || react.emoji.id === (this.realEmojis[i] as GuildEmoji).id).count - 1;
            }
            text += (text.length > 0 ? "\n" : "") + "**[" + num + "]** " + this.realEmojis[i].toString() + " - " + this.options[i];
        }
        return {
            color: 0x0099FF,
            title: "Anketa",
            author: {
                name: Messenger.GetName(this.author),
                icon_url: this.author.user.defaultAvatarURL,
                url: ""
            },
            description: this.title,
            fields: [
                {
                    name: "Konec",
                    value: Moment(this.end).format("DD/MM/YYYY") + "\n" + Moment(this.end).format("h:mm") + ":00",
                    inline: true
                },
                {
                    name: "Typ",
                    value: this.type === 0 ? "Jedna možnost" : "Více možností",
                    inline: true
                },
                {
                    name: "Možnosti",
                    value: text
                }
            ],
            timestamp: new Date()
        };
    }

    createMessage(): void {
        // let embed = new Discord.MessageEmbed()
        //     .setColor("#0099FF")
        //     .setTitle("Anketa")
        //     .setAuthor(Messenger.GetName(this.author), this.author.user.defaultAvatarURL, "")
        //     .setDescription(this.title)
        //     .addField("Možnosti", this.createEmbed(), false)
        //     .setTimestamp();

        this.channel.send({embeds: [this.createEmbed()]}).then(msg => {
            this.message = msg;
            for (let i = 0; i < this.realEmojis.length; ++i) {
                this.message.react(this.realEmojis[i]);
            }
            Main.Database.Run(Main.Config.database.queries.insert.poll, [this.message.channel.id + "-" + this.message.id,
                this.start, this.end, this.author.id, this.title, JSON.stringify(this.options), JSON.stringify(this.emojis)]);
        }).catch(err => {
        });
    }
}