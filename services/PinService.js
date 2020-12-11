const Main = require('../main');
const Service = require('../service');



class PinService extends Service{
    constructor() {
        super();
        this.bot = Main.GetBot('porter');
    }


    async OnReactionAdd(reaction, member){
        if (reaction.emoji.name === '📌' && reaction.count >= 8){

            await reaction.message.pin();
        }
        return true;
    }


}

module.exports = PinService;