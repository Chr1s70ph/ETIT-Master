const fs = require("fs");
var list = ("./birthdayList.txt");

exports.run = (client, message) => {
    var content = message.content;
    var command = content.substring(content.indexOf(" ") + 1);
    command = String(command);
    
    var date = command.split('.');
    foo = date[1] + "-" + date[0] + "-" + date[2];
    var test = new Date(foo);
    console.log(date);
    
    message.channel.send(String(test));
}