/**
 * User: Cloudy
 * Date: 11/12/2020
 * Time: 20:24
 */

let spawn = require("child_process").spawn;
let fs = require('fs');

console.log("Checker activated.");

let bot = null;

function runBot() {
    let errlog = "";
    bot = spawn(process.argv[0], ['main.js'], {
        cwd: process.cwd(),
        env: process.env
    });

    bot.stdout.on('data', (data) => {
        let str = data.toString().replace("\n", "");
        console.log("" + str);
    });

    bot.stderr.on('data', (data) => {
        console.log("An error occurred on bot.");
        let str = data.toString().replace("\n", "");
        errlog += str + "\n";
        console.error("\t" + str);
    });

    bot.on("spawn", () => {
        console.log("Bot started.");
    });

    bot.on("exit", (code) => {
        console.log("Bot has closed, rerunning.");
        fs.writeFile("chkrerr.log", errlog, (err) => {
            if (!err)
                return;
            console.error("An error occurred while writing chkrerr.log");
        });
        runBot();
    });
}

runBot();