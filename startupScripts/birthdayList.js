exports.CheckforBirthday = CheckforBirthday;
var fs = require("fs");

function CheckforBirthday(client) {
    client.channels.cache.get('770276625040146463').send('loading birthdays...'); //sends login embed to channel
    fs.readFile('./birthdayList.txt', 'utf8', (err, data) => {
        if(err) console.log(err);
        //const content = data;
        //client.channels.cache.get('770276625040146463').send(data); //sends login embed to channel
    })
}