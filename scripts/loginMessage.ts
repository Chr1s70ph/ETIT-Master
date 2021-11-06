import { DiscordClient } from "../types/customTypes"
import { MessageEmbed, TextChannel } from "discord.js"
import { readdir as readdir_promise } from "fs/promises"
import { statSync, readdir } from "fs"
const os = require("os")

import project from "../package.json"

exports.run = async (client: DiscordClient) => {
	let commands = []
	let files = await readdir_promise("./commands")
	files.forEach((file) => {
		const element_in_folder = statSync(`./commands/${file}`)
		if (element_in_folder.isDirectory() == true) {
			//check if element is a folder
			const sub_directory = `./commands/${file}/`
			readdir(sub_directory, (err, elements) => {
				//reads all subcommands
				if (err) return console.log(err)
				elements.forEach((element) => {
					commands[commands.length] = element //add command to commands array
				})
			})

			return
		} else {
			commands[commands.length] = file //add command to commands array
		}
	})

	var slashCount = await readdir_promise("./slashCommands")

	const loginMessage = new MessageEmbed() //Login Embed
		.setColor("#ffa500")
		.setAuthor(client.user.tag, "https://www.iconsdb.com/icons/preview/orange/code-xxl.png")
		.setThumbnail(client.user.avatarURL())
		.setTitle("[🌐] Bot erfolgreich gestartet")
		.addFields(
			{
				name: "OS:",
				value: `${os.type()} ${os.release()}`,
				inline: true
			},
			{
				name: "NodeJs:",
				value: `${process.version}`,
				inline: true
			},
			{
				name: "Discord.js:",
				value: `v${project.dependencies["discord.js"].slice(1)}`,
				inline: true
			}
		)
		.addFields(
			{
				name: "Befehle geladen:",
				value: commands.length.toString(),
				inline: true
			},
			{
				name: "SlashCommands geladen:",
				value: slashCount.length.toString(),
				inline: true
			},
			{
				name: "Scheduler:",
				value: "geladen",
				inline: true
			}
		)
		.setTimestamp()
		.setFooter(
			`[ID] ${client.config.ids.userID.botUserID} \nstarted`,
			"https://image.flaticon.com/icons/png/512/888/888879.png"
		)

	const channel = client.channels.cache.find(
		(channel) => channel.id == client.config.ids.channelIDs.dev.botTestLobby
	) as TextChannel
	channel.send({ embeds: [loginMessage] })
}
