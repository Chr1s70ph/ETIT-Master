const config = require("../private/config.json")
const discord = require("../node_modules/discord.js")
const pm2 = require("pm2")

exports.run = async (client, oldPresence, newPresence) => {
	var etitChef = config.ids.userID.etitChef
	let member = newPresence.member
	//UserID to track
	if (member.id === etitChef) {
		try {
			if (oldPresence?.status !== newPresence?.status) {
				//creates emergency Embed in case ETIT-Chef is offline
				const emergency = new discord.MessageEmbed()
					.setColor("#8B0000")
					.setTitle("Der ETIT-Chef ist Offline!!")
					.setAuthor(
						"Offline Detector",
						client.guilds
							.resolve(config.ids.serverID)
							.members.resolve(config.ids.userID.botUserID)
							.user.avatarURL()
					)
					.setThumbnail(
						"https://wiki.jat-online.de/lib/exe/fetch.php?cache=&media=emoticons:lupe.png"
					)
					.addFields({
						name: "Leonard eile zur Hilfe!",
						value: "Wir brauchen dich!"
					})

				if (newPresence.status === "offline") {
					//This is to start an instance of another bot, on the server. This only triggers, when that bot is offline
					client.channels.cache
						.get(config.ids.channelIDs.dev.botTestLobby)
						.send({ content: `<@${config.ids.userID.leonard}>`, embeds: [emergency.setTimestamp()] })
					pm2.connect(function (err) {
						if (err) {
							console.error(err)
							process.exit(2)
						}

						pm2.start(
							{
								name: "ETIT-Chef"
							},
							(err, proc) => {}
						)
					})
				} else if (oldPresence.status === "offline" && newPresence.status === "online") {
					//This is to stop an instance of another bot, on the server. This only triggers, when that bot comes online again
					pm2.connect(function (err) {
						if (err) {
							console.error(err)
							process.exit(2)
						}

						pm2.stop(
							{
								name: "ETIT-Chef"
							},
							(err, proc) => {}
						)
					})
				} else if (newPresence.status === "online") {
					return
				}
			}
		} catch (e) {
			console.log(e)
		}
	}
}
