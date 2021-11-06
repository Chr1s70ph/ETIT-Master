import { Presence } from "discord.js/typings/index.js"
import { DiscordClient } from "../types/customTypes"
import { MessageEmbed, TextChannel } from "discord.js"
import { connect, start, stop } from "pm2"

exports.run = async (
	client: DiscordClient,
	oldPresence: Presence,
	newPresence: Presence
) => {
	var etitChef = client.config.ids.userID.etitChef
	let member = newPresence.member
	//UserID to track
	if (member.id === etitChef) {
		try {
			if (oldPresence?.status !== newPresence?.status) {
				//creates emergency Embed in case ETIT-Chef is offline
				const emergency = new MessageEmbed()
					.setColor("#8B0000")
					.setTitle("Der ETIT-Chef ist Offline!!")
					.setAuthor(
						"Offline Detector",
						client.guilds
							.resolve(client.config.ids.serverID)
							.members.resolve(client.config.ids.userID.botUserID)
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
					const channel = client.channels.cache.find(
						(channel) => channel.id == client.config.ids.channelIDs.dev.botTestLobby
					) as TextChannel
					channel.send({
						content: `<@${client.config.ids.userID.leonard}>`,
						embeds: [emergency.setTimestamp()]
					})
					connect(function (err) {
						if (err) {
							console.error(err)
							process.exit(2)
						}

						start(
							{
								name: "ETIT-Chef"
							},
							(err, proc) => {}
						)
					})
				} else if (oldPresence.status === "offline" && newPresence.status === "online") {
					//This is to stop an instance of another bot, on the server. This only triggers, when that bot comes online again
					connect(function (err) {
						if (err) {
							console.error(err)
							process.exit(2)
						}

						stop("ETIT-Chef", (err, proc) => {})
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
