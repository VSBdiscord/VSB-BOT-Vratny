import * as Mail from "./libs/Mail";

console.log("Sending mail.");
Mail.Send("discord@vsb.cz", "Test", "Test").then(value => {
    console.log("SENT!");
    console.log(value);
}).catch(reason => {
    console.error(reason);
});
