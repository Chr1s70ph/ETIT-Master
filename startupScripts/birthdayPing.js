var fs = require("fs");

exports.run = async (client) => {
    //reads the JSON file and assings it to value
    var json = fs.readFileSync('./privateData/birthdayList.json', 'utf8', (err, data) => {
        if (err) {
            message.channel.send(err)
            return;
        }
    });


    //Checks for birthdays,and count the years
    var jsonDates = JSON.parse(json);
    for (var entry in jsonDates) {
        dateToCheck = jsonDates[entry].date;
        if (checkForToday(dateToCheck) == true) {
            client.channels.cache.get('821657681999429652').send("<@" + jsonDates[entry].NutzerId + "> hat heute geburtstag und ist " + age(dateToCheck) + " Jahre alt :D");
        }
    }

}

//This function returns true, for any date from the list, that matches the current day
function checkForToday(dateToCheck) {
    var today = new Date();
    today = today.toDateString().slice(4, -5);
    dateToCheck = dateToCheck.slice(4, -5);
    return (today === dateToCheck)
}

//checks how long the birthday is in the past
function age(dateToCheck) {
    var today = new Date();
    currentYear = today.toDateString().slice(11);
    birthdayYear = dateToCheck.slice(11);
    return (currentYear - birthdayYear)
}