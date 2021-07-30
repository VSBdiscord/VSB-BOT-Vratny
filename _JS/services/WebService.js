/**
 * User: Cloudy
 * Date: 27/10/2020
 * Time: 18:36
 */

const Service = require("../service");
const Main = require("../main");
const Http = require("http");

class WebService extends Service {
    constructor() {
        super();

        this.bot = Main.GetBot("porter");

        Http.createServer((req, res) => {
            res.write("Test message!");
            res.end();
        }).listen(8080);
    }
}

module.exports = WebService;