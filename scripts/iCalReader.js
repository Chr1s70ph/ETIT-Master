const ical = require("node-ical")
const discord = require("../node_modules/discord.js")
const config = require("../private/config.json")
const schedule = require("node-schedule")
const validUrl = require("valid-url")
const moment = require("moment")
var subjects = config.ids.channelIDs.subject
var serverID = config.ids.serverID
var botUserID = config.ids.userID.botUserID
var embed = ""
const { DateTime } = require("luxon")
const cron_to_fetch_new_notifications = "0 0 * * *"
const cron_to_delete_lesson_notifications = "1 0 * * * " //cron string to trigger deletion of all messages that contain notifications about lessons

exports.run = async (client) => {
	fetchAndSend(client)
	schedule.scheduleJob(cron_to_fetch_new_notifications, async function () {
		fetchAndSend(client)
		let markdownType = "yaml"
		let calendarList = Object.keys(config.calendars).toString()
		let calendars = calendarList.replaceAll(",", "\n")
		//create embed for each new fetch
		var updatedCalendars = new discord.MessageEmbed()
			.setColor("#C7BBED")
			.setAuthor(client.user.tag, client.user.avatarURL())
			.setDescription(
				`**Kalender nach Events durchgesucht**\`\`\`${markdownType}\n${calendars} \`\`\``
			)
		//send notification what calendars have been queried for todays events
		client.channels.cache
			.get(config.ids.channelIDs.dev.botTestLobby)
			.send({ embeds: [updatedCalendars] })
	})
}

async function fetchAndSend(client) {
	var today = localDate()

	for (entry in config.calendars) {
		var icalLink = config.calendars[entry]
		var events = {}
		var webEvents = await ical.async.fromURL(icalLink)
		var eventsFromIcal = await getEvents(webEvents, today, events, client)

		await filterToadaysEvents(client, today, eventsFromIcal)

		if (todaysLessons(events, client).fields.length > 0) {
			var todaysLessonsEmbed = todaysLessons(events, client)
			var icalName = getKeyByValue(config.calendars, icalLink)
			var channelID = findChannelInCategory(icalName, "bot-commands", client)

			sendTodaysLessons(todaysLessonsEmbed, icalName, channelID, events, client)
			await deleteYesterdaysLessonMessage(channelID, icalName, client)
		}
	}
}

/**
 *
 * @param {string} channelID ID of channel to delete the notification Message in
 * @param {string} icalName name of Calendar
 * @param {object} client
 */
async function deleteYesterdaysLessonMessage(channelID, icalName, client) {
	await client.channels.cache
		.get(channelID)
		.messages.fetch({
			limit: 100
		})
		.then((fetchedMessages) => {
			console.log(`fetched ${fetchedMessages.size} messages in ${icalName}`)
			fetchedMessages.forEach((message) => {
				if (message.author.id == config.ids.userID.botUserID) {
					if (message.embeds[0].title.includes("Heutige Benachrichtigungen")) {
						console.log("Found notification Message " + message.id + " in " + icalName)
						scheduleDeleteMessages(channelID, message.id, icalName, client)
					}
				}
			})
		})
}

/**
 * delete messages by ID and category Name
 * @param {string} channelID ID of channel to delete the notification
 * @param {string} messageToDelete ID of the message to be deleted
 * @param {string} categoryName name of category the message is being deleted in
 * @param {object} client
 */
function scheduleDeleteMessages(channelID, messageToDelete, categoryName, client) {
	console.log("Set schedule to delete old reminder list message.")
	var deleteMessages = schedule.scheduleJob(
		dateToRecurrenceRule(undefined, new Date(), undefined, 0, 1),
		function () {
			client.channels.cache
				.get(channelID)
				.messages.fetch(messageToDelete)
				.then(async (msg) => {
					if (msg) {
						try {
							msg.delete()
							console.log("Message deleted in " + categoryName)
						} catch (e) {
							console.log("could not delete message!\n" + e)
						}
					}
				})
		}
	) //function set to only delete notifications at 00:05 AM
}

/**
 *
 * @param {string} categoryName category name
 * @param {string} channelName channel name
 * @param {object} client
 * @returns chanelid of desired channel out of that category
 */
function findChannelInCategory(categoryName, channelName, client) {
	var category = client.channels.cache.find((c) =>
		c.name.toLowerCase().includes(categoryName.toLowerCase())
	)
	var channelId = category.children.find((c) =>
		c.name.toLowerCase().includes(channelName.toLowerCase())
	).id
	return channelId
}

//https://stackoverflow.com/a/28191966/10926046
function getKeyByValue(object, value) {
	return Object.keys(object).find((key) => object[key] === value)
}

function sendTodaysLessons(embed, icalName, channel, events, client) {
	var sendLessons = schedule.scheduleJob(
		dateToRecurrenceRule(undefined, new Date(), undefined, undefined, 5),
		function () {
			client.channels.cache.get(channel).send({ embeds: [todaysLessons(events, client)] })
			console.log(`Todays lessons info sent to ${icalName}`)
		} //function set to only send notifications at 00:05 AM
	)
	console.log(`Set shedule to send todays Lessons for ${icalName}`)
}

function localDate() {
	var tempToday = DateTime.local().toString()
	tempToday.toLocaleString("en-US", { timezone: "Berlin/Europe" })
	var todayString = tempToday.slice(0, -10) + "z"
	var today = new Date(todayString)
	let tzOffset = today.getTimezoneOffset() //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
	today.setHours(-tzOffset / 60) //account for TZ-Offset
	today.setMinutes(0)
	today.setSeconds(0)
	return today
}

//Modified function : https://stackoverflow.com/a/36356320/10926046
Date.prototype.getWeek = function () {
	var date = new Date(this.getTime())
	date.setHours(0, 0, 0, 0)
	date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))

	var week1 = new Date(date.getFullYear(), 0, 4)

	return (
		2 +
		Math.round(
			((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
		)
	)
}

var datesAreOnSameDay = (first, second) =>
	first.getFullYear() === second.getFullYear() &&
	first.getMonth() === second.getMonth() &&
	first.getDate() === second.getDate()

function getEvents(data, today, events, client) {
	var weekStartDate = localDate()
	weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay() + 1)
	var todayEnd = localDate()
	todayEnd.setHours(23)
	todayEnd.setMinutes(59)
	todayEnd.setSeconds(59)

	for (var k in data) {
		// When dealing with calendar recurrences, you need a range of dates to query against,
		// because otherwise you can get an infinite number of calendar events.
		var rangeStart = moment(today)
		var rangeEnd = moment(todayEnd)

		var event = data[k]
		if (event.type === "VEVENT") {
			var title = event.summary
			var description = event.description
			var startDate = moment(event.start)
			var endDate = moment(event.end)

			// Calculate the duration of the event for use with recurring events.
			var duration = parseInt(endDate.format("x")) - parseInt(startDate.format("x"))

			// Simple case - no recurrences, just print out the calendar event.
			if (typeof event.rrule === "undefined" && datesAreOnSameDay(event.start, today)) {
				addEntryToWeeksEvents(events, today.getDay(), event.start, title, description)
			}

			// Complicated case - if an RRULE exists, handle multiple recurrences of the event.
			else if (typeof event.rrule !== "undefined") {
				// For recurring events, get the set of event start dates that fall within the range
				// of dates we're looking for.
				var dates = event.rrule.between(
					rangeStart.toDate(),
					rangeEnd.toDate(),
					true,
					function (date, i) {
						return true
					}
				)

				// The "dates" array contains the set of dates within our desired date range range that are valid
				// for the recurrence rule.  *However*, it's possible for us to have a specific recurrence that
				// had its date changed from outside the range to inside the range.  One way to handle this is
				// to add *all* recurrence override entries into the set of dates that we check, and then later
				// filter out any recurrences that don't actually belong within our range.
				if (event.recurrences != undefined) {
					for (var r in event.recurrences) {
						// Only add dates that weren't already in the range we added from the rrule so that
						// we don't double-add those events.
						if (moment(new Date(r)).isBetween(rangeStart, rangeEnd) != true) {
							dates.push(new Date(r))
						}
					}
				}

				// Loop through the set of date entries to see which recurrences should be printed.
				for (var i in dates) {
					var date = dates[i]
					var curEvent = event
					var showRecurrence = true
					var curDuration = duration

					startDate = moment(date)

					// Use just the date of the recurrence to look up overrides and exceptions (i.e. chop off time information)
					var dateLookupKey = date.toISOString().substring(0, 10)

					// For each date that we're checking, it's possible that there is a recurrence override for that one day.
					if (
						curEvent.recurrences != undefined &&
						curEvent.recurrences[dateLookupKey] != undefined
					) {
						// We found an override, so for this recurrence, use a potentially different title, start date, and duration.
						curEvent = curEvent.recurrences[dateLookupKey]
						startDate = moment(curEvent.start)
						curDuration = parseInt(moment(curEvent.end).format("x")) - parseInt(startDate.format("x"))
					}
					// If there's no recurrence override, check for an exception date.  Exception dates represent exceptions to the rule.
					else if (curEvent.exdate != undefined && curEvent.exdate[dateLookupKey] != undefined) {
						// This date is an exception date, which means we should skip it in the recurrence pattern.
						showRecurrence = false
					}

					// Set the the title and the end date from either the regular event or the recurrence override.
					var recurrenceTitle = curEvent.summary
					endDate = moment(parseInt(startDate.format("x")) + curDuration, "x")

					// If this recurrence ends before the start of the date range, or starts after the end of the date range,
					// don't process it.
					if (endDate.isBefore(rangeStart) || startDate.isAfter(rangeEnd)) {
						showRecurrence = false
					}

					if (showRecurrence === true) {
						addEntryToWeeksEvents(events, today.getDay(), event.start, title, description)
					}
				}
			}
		}
	}

	console.log(events)
	return events
}

/**
 *
 * @param {object} events object of todays events
 * @param {object} client
 * @returns embed with a list of todays lessons
 */
function todaysLessons(events, client) {
	var lessonsEmbed = new discord.MessageEmbed()
		.setColor("#FF0000")
		.setAuthor(
			`Informationen`,
			client.guilds.resolve(serverID).members.resolve(botUserID).user.avatarURL()
		)
		.setTitle("Heutige Benachrichtigungen")
	for (entry in events) {
		var lessonStart = events[entry].start.toString().slice(16, 24)

		//NOTE: the last field is there for a clearer format and it DOES contain an invisible character
		lessonsEmbed.addFields(
			{
				name: "Fach",
				value: events[entry].summary,
				inline: true
			},
			{
				name: "Vorlesungsbeginn",
				value: lessonStart,
				inline: true
			},
			{
				name: "‎",
				value: "‎",
				inline: true
			}
		)
	}
	return lessonsEmbed
}

function convertDate(eventStart) {
	//This works, because the DATE.toString() already converts to Date Object in the propper Timezone
	//All this function does, is take the parameters and sets a new date object based on these parameters
	var convertedDate
	var eventStartString = eventStart.toString()

	var eventYear = eventStartString.slice(11, 15) //11 = startOfYearIndex, 15 = endOfYearIndex
	var enventMonth = monthToIndex(eventStartString.slice(4, 7)) //4 = startOfMonthIndex, 7 = endOfMonthIndex
	var eventDay = eventStartString.slice(8, 10) //8 = startOfDayIndex, 10 = endOfDayIndex
	var eventHours = eventStartString.slice(16, 18) //16 = startOfHourIndex, 10 = endOfHourIndex
	var eventMinutes = eventStartString.slice(19, 21) //8 = startOfMinuteIndex, 10 = endOfMinuteIndex

	return (convertedDate = new Date(
		eventYear,
		enventMonth,
		eventDay,
		eventHours,
		eventMinutes
	))
}

function monthToIndex(month) {
	var months = {
		Jan: "0",
		Feb: "1",
		Mar: "2",
		Apr: "3",
		May: "4",
		Jun: "5",
		Jul: "6",
		Aug: "7",
		Sep: "8",
		Okt: "9",
		Nov: "10",
		Dec: "11"
	}

	return months[month]
}

function addEntryToWeeksEvents(events, day, start, summary, description) {
	events[Object.keys(events).length] = {
		day: day,
		start: start,
		summary: summary,
		description: description
	}

	return events
}

function amountOfDaysDifference(dateToday, dateToCheck) {
	var milisecondsInOneMinute = 1000
	var minutesInOneHour = 3600
	var hoursInOneDay = 24
	var timediff = Math.abs(dateToCheck - dateToday.getTime())
	var diffDays = Math.ceil(
		timediff / (milisecondsInOneMinute * minutesInOneHour * hoursInOneDay)
	)

	return diffDays
}

async function filterToadaysEvents(client, today, thisWeeksEvents) {
	for (entry in thisWeeksEvents) {
		if (thisWeeksEvents[entry].day == today.getDay()) {
			var event = thisWeeksEvents[entry]
			var summary = event.summary
			//extract the subject after the "-" in the string
			var subject = summary.split("-")[1]

			//extract the professors Name before the "-" in the string
			var professor = summary.split("-")[0]

			var link = extractZoomLinks(event.description)

			var RecurrenceRule = dateToRecurrenceRule(event.start, today)

			var role = findRole(subject, client)

			var embed = dynamicEmbed(client, role, subject, professor, link)

			var channel = findChannel(subject, client)

			if (channel == undefined) {
				channel = config.ids.channelIDs.generalChannels.general
			}

			if (noVariableUndefined(RecurrenceRule, channel, role, embed, client)) {
				role = "<@&" + role + ">"
			} else if (role == undefined) {
				role = ""
			}

			createCron(RecurrenceRule, channel, role, embed, link, client)
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

	let splitString = ">"

	//check for 'id' , because some links might contain an id parameter, which is not needed
	if (description.includes("id")) {
		splitString = "id"
	}
	//check for '#success' , because some links might have been copied wrong
	if (description.includes("#success")) {
		splitString = "#success"
	}
	//check for html hyperlink parsing , because google calendar does some weird stuff
	if (description.includes("<a href=")) {
		return description.split("<a href=")[1].split(splitString)[0]
	} else {
		return description
	}
}

/**
 * Create CronTimestamp for event
 * @param {Date} eventDate datestring of Event
 * @param {Object} todaysDate Dateobject
 */
function dateToRecurrenceRule(eventDate, todaysDate) {
	const rule = new schedule.RecurrenceRule()
	rule.second = eventDate.getSeconds()
	rule.minute = eventDate.getMinutes()
	rule.hour = eventDate.getHours()
	rule.date = todaysDate.getDate()
	rule.month = todaysDate.getMonth()
	rule.year = todaysDate.getFullYear()
	rule.tz = "Europe/Berlin"
	return rule
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
	var roleColor = client.guilds.resolve(serverID).roles.cache.get(role).color
	var courseType = "Vorlesung"

	if (subject.includes("(ü)") || subject.includes("(Ü)")) courseType = "Übung"

	try {
		var embedDynamic = new discord.MessageEmbed()
			.setColor(roleColor)
			.setAuthor(
				`${courseType}s Reminder`,
				client.guilds.resolve(serverID).members.resolve(botUserID).user.avatarURL()
			)
			.setTitle(subject + " Reminder")
			.setDescription(`Die ${courseType} fängt in 5 Minuten an`)
			.setThumbnail("https://pics.freeicons.io/uploads/icons/png/6029094171580282643-512.png")
			.addFields({
				name: "Dozent",
				value: professor,
				inline: false
			})
			.setFooter(
				"Viel Spaß und Erfolg wünscht euch euer ETIT-Master",
				client.guilds.resolve(serverID).members.resolve(botUserID).user.avatarURL()
			)
	} catch (e) {
		embed = "There was an error creating the embed"
		client.channels.cache.get("770276625040146463").send(embed + "\n" + e) //sends login embed to channel
	}

	if (link) {
		embedDynamic.setURL(link)
	}

	return embedDynamic
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
function findChannel(subject, client) {
	var channel = ""
	const REGEX_TO_REMOVE_EMOJIS =
		/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g

	subject = subject.trim() //remove leading and trailing space
	subject = subject.replace(/ *\([^)]*\) */g, "") //remove all content in, and brackets
	subject = subject.replace(/\s+/g, "-") //replace all spaces with "-"
	subject = subject.toLowerCase()
	const guild = client.guilds.cache.get(config.ids.serverID)
	channel = guild.channels.cache.find(
		(channel) =>
			channel.name.replace(REGEX_TO_REMOVE_EMOJIS, "").toLowerCase() == subject.toLowerCase()
	).id
	return channel
}

function findRole(subject, client) {
	var role = ""
	subject = subject.trim() //remove leading and trailing space
	subject = subject.replace(/ *\([^)]*\) */g, "") //remove all content in, and brackets
	const guild = client.guilds.cache.get(config.ids.serverID)
	role = guild.roles.cache.find(
		(role) => subject.toLowerCase() == role.name.toLowerCase()
	).id
	return role
}

function noVariableUndefined() {
	for (arg in arguments) {
		if (arguments[arg] == undefined) {
			return false
		}
	}

	return true
}

/**
 *
 * @param {string} RecurrenceRule string in RecurrenceRule format
 * @param {string} channel destination channel for message
 * @param {string} role role what is supposed to be pinged
 * @param {object} embed embed what is sent
 * @param {object} client required by discord.js
 */
function createCron(RecurrenceRule, channel, role, embed, link, client) {
	let channelName = client.channels.cache.get(channel).name

	if (!validUrl.isUri(link)) {
		var sendNotification = schedule.scheduleJob(RecurrenceRule, function () {
			console.log(`Sent notification to ${channelName}`)
			client.channels.cache
				.get(channel)
				.send({ content: role, embeds: [embed.setTimestamp()] })
				.then((msg) => {
					setTimeout(function () {
						try {
							msg.delete()
							console.log(`Deleted notification in ${channelName}`)
						} catch (error) {
							console.log(`There was a problem deleting the notification in ${channelName}\n${error}`)
						}
					}, 5400000)
				})
		})
	} else {
		var sendNotification = schedule.scheduleJob(RecurrenceRule, function () {
			console.log(`Sent notification to ${channelName}`)
			client.channels.cache
				.get(channel)
				.send({ content: role, embeds: [embed.setTimestamp()] })
				.then((msg) => {
					setTimeout(function () {
						try {
							msg.delete()
							console.log(`Deleted notification in ${channelName}`)
						} catch (error) {
							console.log(`There was a problem deleting the notification in ${channelName}\n${error}`)
						}
					}, 5400000)
				})
		})
	}
}
