const ical = require('node-ical');
const discord = require('../node_modules/discord.js');
const config = require("../privateData/config.json");
const schedule = require('node-schedule');
const util = require('util');
var subjects = config.ids.channelIDs.subject;
var serverID = config.ids.serverID;
var botUserID = config.ids.userID.botUserID;
var debugChannel = config.ids.channelIDs.dev.botTestLobby;
var embed = '';
const { DateTime } = require('luxon');


exports.run = async (client) => {

    var today = localDate();
    for (entry in config.calenders) {
        var events = {};
        var webEvents = await ical.async.fromURL(config.calenders[entry]);
        var eventsFromIcal = await getEvents(webEvents, today, client, events);
        await filterToadaysEvents(client, today, eventsFromIcal);
    }
}


function localDate() {
    var tempToday = DateTime.local().toString();
    var todayString = tempToday.slice(0, -10) + "z";
    var today = new Date(todayString);
    return today;
}


//NOTE: This function is from stackoverflow
//I don't understand it, but it works
Date.prototype.getWeek = function() {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);

    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);

    var week1 = new Date(date.getFullYear(), 0, 4);
    return 2 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

var datesAreOnSameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();




function getEvents(webEvents, today, client, events) {
    var weekStartDate = localDate();
    weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay() + 1)
    
    mainLoop:
    for (entry in webEvents) {
        var icalEvent = webEvents[entry];
        if (icalEvent.type == "VEVENT") {
            var summary = icalEvent.summary;


            var startOfEventa = icalEvent.start;
            eventStart = convertEventDate(startOfEventa, summary);

            var description = icalEvent.description;
            // console.log("Event:  " + summary + " is in Loop \n" + eventStart)       
            if (datesAreOnSameDay(eventStart, today)) {
                addEntryToWeeksEvents(events, eventStart.getDay(), eventStart, summary, description)
                continue;
            }                     
            
            if (eventStart > today) {
                // console.log("removed " + summary + " greater than today \n" + eventStart + "\n" + today)                            
                continue;
                
            }
            
            
            //check if rrule exists in icalEvent
            if (icalEvent.rrule) {
                var ruleOption = icalEvent.rrule.options;
                

                // console.log("Event:  " + summary + " in rrule \n" + eventStart + "\n" + ruleOption.until)       
                if (ruleOption.until) {                    
                    if ((ruleOption.until - today) < 0) {
                        // console.log("removed " + summary + " because of until");
                        continue;
                    }
                }
                

                var count = ruleOption.count;
                if (count) {
                    if (ruleOption.interval > 1) {
                        var interval = ruleOption.interval;
                        //retuns days until last day of webEvent based on interval
                        var daysInWeek = 7;
                        var intervalEndDate = new Date(eventStart + daysInWeek * interval * count);
                        if (amountOfDaysDifference(today, intervalEndDate) < 0) {
                            // console.log("removed " + summary + " count" + eventStart)                            
                            continue;
                        }
                    }
                }
                
                if (ruleOption.interval) {                    
                    var interval = ruleOption.interval;
                    if ((Math.abs(weekStartDate.getWeek() - eventStart.getWeek()) % interval) == 0) {
                        var byday = ruleOption.byweekday;
                        var weekdayToday = today.getDay();
                        // weekdayToday -= 1;
                        if (byday) {
                            for (day in byday) {
                                if ((byday[day] +1) == weekdayToday) {
                                    if (icalEvent.exdate) {
                                        for (entry in icalEvent.exdate) {
                                            if (icalEvent.exdate[entry] != today) {
                                                addEntryToWeeksEvents(events, byday[day] + 1, eventStart, summary, description)
                                                continue mainLoop;
                                            }
                                        }
                                    } else {                                        
                                        addEntryToWeeksEvents(events, eventStart.getDay(), eventStart, summary, description)
                                        continue mainLoop;
                                    }
                                }
                            }
                        } else {
                            addEntryToWeeksEvents(events, eventStart.getDay(), eventStart, summary, description)                            
                        }                        
                    }
                    // console.log("removed " + summary + " interval" + eventStart)
                    continue;
                }
                
                var byday = ruleOption.byweekday;
                if (byday.length > 1) {
                    for (day in byday) {
                        if (byday[day] == (today.getDay() - 1)) {
                            if (icalEvent.exdate) {
                                for (entry in icalEvent.exdate) {
                                    if (icalEvent.exdate[entry].getDay() != byday[day]) {
                                        addEntryToWeeksEvents(events, icalEvent.exdate[entry].getDay(), eventStart, summary, description)
                                    }
                                }
                            }
                        }
                    }
                }
                
                if (icalEvent.exdate) {
                    var exdate = icalEvent.exdate;
                    for (date in exdate) {
                        if (exdate[date] != today) {
                            addEntryToWeeksEvents(events, eventStart.getDay(), eventStart, summary, description);
                        } else if (exdate[date] > today) {
                            // console.log("removed " + summary + " exdate" + eventStart)
                            continue mainLoop;
                        }
                    }
                }
            }        
        }
    }
    // console.log(events)
    return events;
}


function convertEventDate(eventStart, summary) {
    var convertedDate = "";
    var timezone = eventStart.tz;
    if (timezone == "Etc/UTC") {
        convertedDate = eventStart.toISOString();
        convertedDate = DateTime.fromISO(convertedDate).setZone("Europe/Berlin").toString();
        convertedDate = convertedDate.slice(0, -10) + "z";
        convertedDate = new Date(convertedDate);
    } else if (timezone == "Europe/Berlin" || eventStart.toString().includes("Europe")) {
        convertedDate = new Date(eventStart)
    } else if (eventStart.dateOnly) {
        convertedDate = new Date(eventStart)
    } else{
        console.log("\n\n There was an unexpected Error converting" + summary +"\n"  + eventStart +" to local Time Zone \n\n" )
        convertedDate = new Date(eventStart);        
    }
    return convertedDate;
}


function addEntryToWeeksEvents(events, day, start, summary, description) {
    events[Object.keys(events).length] = {
        "day": day,
        "start": start,    
        "summary": summary,
        "description": description
    }
    return events
}

function amountOfDaysDifference(dateToday, dateToCheck) {
    var milisecondsInOneMinute = 1000;
    var minutesInOneHour = 3600;
    var hoursInOneDay = 24;
    var timediff = Math.abs(dateToCheck - dateToday.getTime());
    var diffDays = Math.ceil(timediff / (milisecondsInOneMinute * minutesInOneHour * hoursInOneDay));

    return diffDays;
}

function debug(message, client) {
    client.channels.cache.get(debugChannel).send(`\`\`\`js\n${message}\`\`\``, {split: true});
}

async function filterToadaysEvents(client, today, thisWeeksEvents) {
    for (entry in thisWeeksEvents) {
        if (thisWeeksEvents[entry].day == today.getDay()) {
            var event = thisWeeksEvents[entry];
            var summary = event.summary;
            //extract the subject after the "-" in the string
            var subject = summary.split('-')[1];
            
            //extract the professors Name before the "-" in the string 
            var professor = summary.split('-')[0];
            
            var link = extractZoomLinks(event.description);
            
            var time = event.start;
            
            var cronDate = dateToCron(time);
            
            var embed = dynamicEmbed(client, findRole(subject, config.ids.roleIDs), subject, professor, link)
            
            createCron(cronDate, findChannel(subject, config.ids.channelIDs.subject), findRole(subject, config.ids.roleIDs), embed, client);
                    


            

            client.channels.cache.get('770276625040146463').send(embed.setTimestamp())
        }
    }
}


/**
 * extracts the zoom Links from HTML tag
 * if the HTML tag contains "#success" it cuts the string before that string, to make the link automatically open zoom 
 * @param {*} description 
 * @returns link
 */
function extractZoomLinks(description) {
    if (description.length == 0) {
        return 
    }
    let splitString = '>'
    if (description.includes('#success')) {
        splitString = '#success'
    }
    if (description.includes('<a href=')) {
        return description.split('<a href=')[1].split(splitString)[0];           
    } else {
        return description;
    }

}

/**
 * generate all needed variables for the CRON-Format
 *  
 * SECONDS MINUTES HOURS DAY_OF_MONTH MONTH DAY_OF_WEEK
 * 
 * @param {Date} date 
 * @returns 
 */
function dateToCron(date) {
    //
    //
    var seconds = '0';
    var minutes = '55';
    var hour = date.getHours() -1; //Subtract one, to give the alert not at the exact start of the event, but coupled with minutes = '55' 5 minutes earlier
    var dayOfMonth = '*'; //set to * so the Cron is for the current week
    var month = '*'; //set to * so the Cron is for the current week
    var day = date.getDay();  //Extracts the weekday of the date string

    var cronString = seconds + ' ' + minutes + ' ' + hour + ' ' + dayOfMonth + ' ' + month + ' ' + day;

    return cronString;
}

/**
 * Builds dynamic embed
 * 
 * Only returns an embed with link, when link is set
 * 
 * @param {object} client needed for the client Avatar
 * @param {string} subject used to set the Title and contents of the embed
 * @param {string} professor sets the professor
 * @param {string} link link to the lecture
 * @returns {any} Embed that was built using the given parameters
 */
function dynamicEmbed(client, role, subject, professor, link) {
    var roleColor = client.guilds.resolve(serverID).roles.cache.get(role).color;


    var embedDynamic = new discord.MessageEmbed()
            .setColor(roleColor)
            .setAuthor(subject + ' Reminder', client.guilds.resolve(serverID).members.resolve(botUserID).user.avatarURL())
            .setTitle(subject + ' Reminder')
            .setDescription(subject + ' fängt in 5 Minuten an')
            .setThumbnail('https://www.pngarts.com/files/7/Zoom-Logo-PNG-Download-Image.png')
            .addFields(
                { name: subject + ' findet wie gewohnt auf Zoom statt.', value: 'Außer es gibt einen Sonderfall' },
                { name: 'Dozent', value: professor, inline: false }
            )
        .setFooter('Viel Spaß und Erfolg wünscht euch euer ETIT-Master', client.guilds.resolve(serverID).members.resolve(botUserID).user.avatarURL());
        
    if (link.length != 0) {

        embedDynamic.setURL(link);

    }
    return embedDynamic;
}

/**
 * returns channelID
 * 
 * analyzes the contents of the "subject" and sets "channel" based on its contents
 * sends in case of an error, said error to the debug channel
 * 
 * @param {object} client necessary to return error messages to debug channel
 * @param {String} subject subject exported from iCal
 * @return {string}     returns the channelID based on subject
 * 
 * @throws Error in debug channel
 */
function findChannel(subject, channels) {
    var channel = "";
    Object.keys(channels).forEach(function (key) {
        if (subject.includes(key)) {
            channel = channels[key];
        }
    })

    return channel;
    

}

function findRole(subject, roles) {
    var role = "";
    Object.keys(roles).forEach(function (key) {
        if (subject.includes(key)) {
            role = roles[key];
        }
    })

    return role;
    

}

/**
 * creates a dynamic Cron schedule
 * @param {string} cronDate cronDate in the right format(eg https://crontab.guru/)
 * @param {string} channel valid channelID to send the message to
 * @param {object} embed  message (here an embed, but generally it does not matter)
 * @param {object} client 
 */
function createCron(cronDate, channel, role ,embed, client) {
    var job = schedule.scheduleJob(cronDate, function () {
        client.channels.cache.get(channel).send('<@&' + role + '>', embed.setTimestamp())
        .then(msg => msg.delete({ timeout: 5400000 }))
    });
}