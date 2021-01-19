const Main = require('../main');
const Service = require('../service');



class PinService extends Service{
    constructor() {
        super();
        this.bot = Main.GetBot('porter');
    }


    async OnReactionAdd(reaction, GuildMember){

        if (reaction.emoji.name === '📌' && reaction.count > 7){
            await reaction.message.pin();
        }
        return true;
    }


}

module.exports = PinService;