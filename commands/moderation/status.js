const config = require("../../privateData/config.json")

exports.name = "status"

exports.description = "Setzt den Status des Bottes"

exports.usage = `${config.prefix}status {STATUS} {ICON}`

exports.example = `${config.prefix}status Bitte nicht stören -dnd\n
${config.prefix}status `

let presence = {
	status: "",
	activity: {
		name: "",
		type: "PLAYING"
	}
}

exports.presence = presence

exports.run = (client, message) => {
	if (!Object.values(config.ids.acceptedAdmins).includes(message.author.id))
		return message.reply("You do not have the permissions to perform that command.")

	let messageContent = message.content

	messageContent = messageContent.split(".status")[1]

	let activityName = messageContent.split("-")[0]
	presence.activity.name = activityName

	let icon = messageContent.split("-")[1]
	if (icon) {
		if (icon == "online") {
			presence.status = "online"
		} else if (icon == "dnd") {
			presence.status = "dnd"
		} else if (icon == "idle") {
			presence.status = "idle"
		} else if (icon == "invisible" || icon == "offline") {
			presence.status = "invisible"
		} else {
			message.channel.send("Please enter a valid status type.")
		}
	} else {
		presence.status = "online"
	}

	console.log(presence)

	if (presence.activity.name == " " || presence.activity.name == "") {
		let defaultPresence = config.presence[0]
		Presence(client, message, defaultPresence)
	} else {
		Presence(client, message, presence)
	}
}

function Presence(client, message, presence) {
	console.log(presence)
	client.user.setPresence(presence)
	message.channel.send("👥Präsenz wurde geupdated!")
}
