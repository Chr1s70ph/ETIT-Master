import { CategoryChannel, Guild, MessageEmbed, TextChannel } from "discord.js"
import { GuildChannel } from "discord.js/typings/index.js"
import moment from "moment"
import { async } from "node-ical"
import { RecurrenceRule, scheduleJob } from "node-schedule"

import { DiscordClient } from ".."

var embed = ""
const { DateTime } = require("luxon")
const cron_to_fetch_new_notifications = "0 0 * * *"
const cron_to_delete_lesson_notifications = "1 0 * * * " //cron string to trigger deletion of all messages that contain notifications about lessons

exports.run = async (client: DiscordClient) => {
	fetchAndSend(client)
	scheduleJob(cron_to_fetch_new_notifications, async function () {
		fetchAndSend(client)
		let markdownType = "yaml"
		let calendarList = Object.keys(client.config.calendars).toString()
		let calendars = calendarList.replaceAll(",", "\n")
		//create embed for each new fetch
		var updatedCalendars = new MessageEmbed()
			.setColor("#C7BBED")
			.setAuthor(client.user.tag, client.user.avatarURL())
			.setDescription(
				`**Kalender nach Events durchgesucht**\`\`\`${markdownType}\n${calendars} \`\`\``
			)
		//send notification what calendars have been queried for todays events
		const channel = client.channels.cache.find(
			(channel) => channel.id == client.config.ids.channelIDs.dev.botTestLobby
		) as TextChannel
		channel.send({ embeds: [updatedCalendars] })
	})
}

async function fetchAndSend(client: DiscordClient) {
	var today: Date = localDate()

	for (var entry in client.config.calendars) {
		var icalLink = client.config.calendars[entry]
		var events = {}
		var webEvents = await async.fromURL(icalLink)
		var eventsFromIcal = await getEvents(webEvents, today, events, client)
		await filterToadaysEvents(client, today, eventsFromIcal)

		if (todaysLessons(events, client).fields.length > 0) {
			var todaysLessonsEmbed = todaysLessons(events, client)
			var icalName = getKeyByValue(client.config.calendars, icalLink)
			var channelID = findChannelInCategory(icalName, "bot-commands", client)

			sendTodaysLessons(icalName, channelID, events, client)
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
async function deleteYesterdaysLessonMessage(
	channelID: string,
	icalName: string,
	client: DiscordClient
) {
	const channel = (await client.channels.cache.find(
		(channel) => channel.id == channelID
	)) as TextChannel
	channel.messages
		.fetch({
			limit: 100
		})
		.then((fetchedMessages) => {
			console.log(`fetched ${fetchedMessages.size} messages in ${icalName}`)
			fetchedMessages.forEach((message) => {
				if (message.author.id == client.config.ids.userID.botUserID) {
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
function scheduleDeleteMessages(
	channelID: string,
	messageToDelete: {},
	categoryName: string,
	client: DiscordClient
) {
	console.log("Set schedule to delete old reminder list message.")
	var deleteMessages = scheduleJob(
		dateToRecurrenceRule(undefined, new Date()),
		function () {
			const channel = client.channels.cache.find(
				(channel) => channel.id == channelID
			) as TextChannel
			channel.messages.fetch(messageToDelete).then(async (msg) => {
				if (msg) {
					try {
						msg.delete("true")
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
function findChannelInCategory(
	categoryName: string,
	channelName: string,
	client: DiscordClient
) {
	var category = client.channels.cache.find((c: CategoryChannel) =>
		c.name.toLowerCase().includes(categoryName.toLowerCase())
	) as CategoryChannel
	var channelId = category.children.find((c: GuildChannel) =>
		c.name.toLowerCase().includes(channelName.toLowerCase())
	).id
	return channelId
}

//https://stackoverflow.com/a/28191966/10926046
function getKeyByValue(object: object, value: string) {
	return Object.keys(object).find((key) => object[key] === value)
}

function sendTodaysLessons(
	icalName: string,
	_channel: string,
	events: {},
	client: DiscordClient
) {
	var sendLessons = scheduleJob(
		dateToRecurrenceRule(undefined, new Date()),
		function () {
			const channel = client.channels.cache.find(
				(channel) => channel.id.toString() == _channel
			) as TextChannel
			channel.send({ embeds: [todaysLessons(events, client)] })
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
	today.setMinutes(0)
	today.setSeconds(0)
	return today
}

var datesAreOnSameDay = (first: Date, second: Date) =>
	first.getFullYear() === second.getFullYear() &&
	first.getMonth() === second.getMonth() &&
	first.getDate() === second.getDate()

function getEvents(data: {}, today: Date, events: {}, client: DiscordClient) {
	var weekStartDate = localDate()
	weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay() + 1)
	var todayStart = today
	todayStart.setUTCHours(0, 0, 0, 0)
	var todayEnd = localDate()
	todayEnd.setHours(23)
	todayEnd.setMinutes(59)
	todayEnd.setSeconds(59)

	var rangeStart = moment(todayStart).utc()
	var rangeEnd = moment(todayEnd)

	for (var k in data) {
		if (data.hasOwnProperty(k)) {
			// When dealing with calendar recurrences, you need a range of dates to query against,
			// because otherwise you can get an infinite number of calendar events.

			var event = data[k]
			if (event.type === "VEVENT") {
				var title = event.summary
				var description = event.description
				var startDate = moment(event.start)
				var endDate = moment(event.end)

				// Calculate the duration of the event for use with recurring events.
				var duration =
					Number.parseInt(endDate.format("x"), 10) - Number.parseInt(startDate.format("x"), 10)

				// Simple case - no recurrences, just print out the calendar event.
				if (typeof event.rrule === "undefined" && datesAreOnSameDay(event.start, today)) {
					addEntryToWeeksEvents(
						events,
						today.getDay().toString(),
						event.start,
						title,
						description,
						event.location
					)
				} else if (typeof event.rrule !== "undefined") {
					// Complicated case - if an RRULE exists, handle multiple recurrences of the event.
					// For recurring events, get the set of event start dates that fall within the range
					// of dates we're looking for.
					const dates = event.rrule.between(rangeStart.toDate(), rangeEnd.toDate(), true, () => {
						return true
					})

					// The "dates" array contains the set of dates within our desired date range range that are valid
					// for the recurrence rule.  *However*, it's possible for us to have a specific recurrence that
					// had its date changed from outside the range to inside the range.  One way to handle this is
					// to add *all* recurrence override entries into the set of dates that we check, and then later
					// filter out any recurrences that don't actually belong within our range.
					if (event.recurrences !== undefined) {
						for (const r in event.recurrences) {
							// Only add dates that weren't already in the range we added from the rrule so that
							// we don't double-add those events.
							if (moment(new Date(r)).isBetween(rangeStart, rangeEnd) !== true) {
								dates.push(new Date(r))
							}
						}
					}

					// Loop through the set of date entries to see which recurrences should be printed.
					for (const i in dates) {
						const date = dates[i]
						let curEvent = event
						let showRecurrence = true
						let curDuration = duration

						startDate = moment(date)

						// Use just the date of the recurrence to look up overrides and exceptions (i.e. chop off time information)
						const dateLookupKey = date.toISOString().slice(0, 10)

						// For each date that we're checking, it's possible that there is a recurrence override for that one day.
						if (
							curEvent.recurrences !== undefined &&
							curEvent.recurrences[dateLookupKey] !== undefined
						) {
							// We found an override, so for this recurrence, use a potentially different title, start date, and duration.
							curEvent = curEvent.recurrences[dateLookupKey]
							startDate = moment(curEvent.start)
							curDuration =
								Number.parseInt(moment(curEvent.end).format("x"), 10) -
								Number.parseInt(startDate.format("x"), 10)
						} else if (
							curEvent.exdate !== undefined &&
							curEvent.exdate[dateLookupKey] !== undefined
						) {
							// If there's no recurrence override, check for an exception date.  Exception dates represent exceptions to the rule.
							// This date is an exception date, which means we should skip it in the recurrence pattern.
							showRecurrence = false
						}

						// Set the the title and the end date from either the regular event or the recurrence override.
						const recurrenceTitle = curEvent.summary
						endDate = moment(Number.parseInt(startDate.format("x"), 10) + curDuration, "x")

						// If this recurrence ends before the start of the date range, or starts after the end of the date range,
						// don't process it.
						if (endDate.isBefore(rangeStart) || startDate.isAfter(rangeEnd)) {
							showRecurrence = false
						}

						if (showRecurrence === true && datesAreOnSameDay(date, today)) {
							addEntryToWeeksEvents(
								events,
								today.getDay().toString(),
								curEvent.start,
								recurrenceTitle,
								curEvent.description,
								curEvent.location
							)
						}
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
function todaysLessons(events: {}, client: DiscordClient) {
	var lessonsEmbed = new MessageEmbed()
		.setColor("#FF0000")
		.setAuthor(
			`Informationen`,
			client.guilds
				.resolve(client.config.ids.serverID)
				.members.resolve(client.config.ids.userID.botUserID)
				.user.avatarURL()
		)
		.setTitle("Heutige Benachrichtigungen")
	for (var entry in events) {
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

function addEntryToWeeksEvents(
	events: {},
	day: string,
	start: Date,
	summary: string,
	description: string,
	location: string
) {
	//protection against double events
	for (var elemtent in events) {
		if (
			events[elemtent].start === start &&
			events[elemtent].summary === summary &&
			events[elemtent].description === description &&
			events[elemtent].location === location
		) {
			return events
		}
	}
	events[Object.keys(events).length] = {
		day: day,
		start: start,
		summary: summary,
		description: description,
		location: location
	}

	return events
}

async function filterToadaysEvents(
	client: DiscordClient,
	today: Date,
	thisWeeksEvents: {}
) {
	const MS_PER_MINUTE = 60000
	const EVENT_NOTIFICATION_OFFSET_MINUTES = 20

	for (var entry in thisWeeksEvents) {
		if (thisWeeksEvents[entry].day == today.getDay()) {
			var event = thisWeeksEvents[entry]
			var summary = event.summary
			//extract the subject after the "-" in the string
			var subject = summary.split("-")[1]

			//extract the professors Name before the "-" in the string
			var professor = summary.split("-")[0]

			var link = extractZoomLinks(event.description)

			var earlyEventStart = new Date(
				event.start - EVENT_NOTIFICATION_OFFSET_MINUTES * MS_PER_MINUTE
			)

			var RecurrenceRule = dateToRecurrenceRule(earlyEventStart, today)

			var role = findRole(subject, client)

			var embed = dynamicEmbed(
				client,
				role,
				subject,
				professor,
				EVENT_NOTIFICATION_OFFSET_MINUTES,
				link,
				event.location
			)

			var channel = findChannel(subject, client)

			if (channel == undefined) {
				channel = client.config.ids.channelIDs.generalChannels.general
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
function extractZoomLinks(description: string) {
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
function dateToRecurrenceRule(eventDate: Date, todaysDate: Date) {
	const rule = new RecurrenceRule()
	rule.second = typeof eventDate === "undefined" ? 0 : eventDate.getSeconds()
	rule.minute = typeof eventDate === "undefined" ? 0 : eventDate.getMinutes()
	rule.hour = typeof eventDate === "undefined" ? 0 : eventDate.getHours()
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
function dynamicEmbed(
	client: DiscordClient,
	role: string,
	subject: string,
	professor: string,
	lessonsOffset: number,
	link: string,
	location: string
): MessageEmbed {
	var roleColor = client.guilds
		.resolve(client.config.ids.serverID)
		.roles.cache.get(role).color
	var courseType = "Vorlesung"

	if (subject.includes("(ü)") || subject.includes("(Ü)")) courseType = "Übung"

	var embedDynamic = new MessageEmbed()
	try {
		embedDynamic
			.setColor(roleColor)
			.setAuthor(
				`${courseType}s Reminder`,
				client.guilds
					.resolve(client.config.ids.serverID)
					.members.resolve(client.config.ids.userID.botUserID)
					.user.avatarURL()
			)
			.setTitle(subject + " Reminder")
			.setDescription(`Die ${courseType} fängt in ${lessonsOffset} Minuten an`)
			.setThumbnail("https://pics.freeicons.io/uploads/icons/png/6029094171580282643-512.png")
			.addField("Dozent", professor, false)
			.setFooter(
				"Viel Spaß und Erfolg wünscht euch euer ETIT-Master",
				client.guilds
					.resolve(client.config.ids.serverID)
					.members.resolve(client.config.ids.userID.botUserID)
					.user.avatarURL()
			)
	} catch (e) {
		embed = "There was an error creating the embed"
		const channel = client.channels.cache.find(
			(_channel) => _channel.id == "852530207336169523"
		) as TextChannel
		channel.send(embed + "\n" + e) //sends login embed to channel
	}

	if (link) {
		embedDynamic.setURL(link)
	}

	if (location) {
		embedDynamic.addField(
			"Location:",
			`${location} [Maps](https://www.google.com/maps/search/KIT+${encodeURIComponent(
				location
			)})`,
			false
		)
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
function findChannel(subject: string, client: DiscordClient): string {
	const REGEX_TO_REMOVE_EMOJIS =
		/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g

	subject = subject.trim() //remove leading and trailing space
	subject = subject.replace(/ *\([^)]*\) */g, "") //remove all content in, and brackets
	subject = subject.replace(/\s+/g, "-") //replace all spaces with "-"
	subject = subject.toLowerCase()
	const guild = client.guilds.cache.get(client.config.ids.serverID) as Guild
	var channel = guild.channels.cache.find(
		(channel) =>
			channel.name.replace(REGEX_TO_REMOVE_EMOJIS, "").toLowerCase() == subject.toLowerCase()
	) as TextChannel

	let channelID = channel?.id ? channel.id : client.config.ids.channelIDs.dev.botTestLobby

	return channelID
}

function findRole(subject, client) {
	subject = subject.trim() //remove leading and trailing space
	subject = subject.replace(/ *\([^)]*\) */g, "") //remove all content in, and brackets
	const guild = client.guilds.cache.get(client.config.ids.serverID)
	let role =
		guild.roles.cache.find((role) => subject.toLowerCase() == role.name.toLowerCase())?.id ??
		null
	return role
}

function noVariableUndefined(...args) {
	for (var arg in arguments) {
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
function createCron(
	RecurrenceRule: RecurrenceRule,
	_channel: string,
	role: string,
	embed: MessageEmbed,
	link: string,
	client: DiscordClient
) {
	const channel = client.channels.cache.find(
		(channel) => channel.id == _channel
	) as TextChannel
	let channelName = channel.name

	var sendNotification = scheduleJob(RecurrenceRule, function () {
		console.log(`Sent notification to ${channelName}`)
		const notificationChannel = client.channels.cache.find(
			(_channel) => _channel == channel
		) as TextChannel
		notificationChannel
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
