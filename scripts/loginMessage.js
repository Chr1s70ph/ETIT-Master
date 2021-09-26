const discord = require("discord.js")
const fs = require("fs")
const config = require("../private/config.json")
const os = require("os")
const package = require("../package.json")

exports.run = async (client) => {
	let commands = []
	files = await fs.promises.readdir("./commands")
	files.forEach((file) => {
		const element_in_folder = fs.statSync(`./commands/${file}`)
		if (element_in_folder.isDirectory() == true) {
			//check if element is a folder
			const sub_directory = `./commands/${file}/`
			fs.readdir(sub_directory, (err, elements) => {
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

	var slashCount = await fs.promises.readdir("./slashCommands", (err, files) => {
		return files
	})

	const loginMessage = new discord.MessageEmbed() //Login Embed
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
				value: `v${package.dependencies["discord.js"].slice(1)}`,
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
			`[ID] ${config.ids.userID.botUserID} \nstarted`,
			"https://image.flaticon.com/icons/png/512/888/888879.png"
		)

	client.channels.cache
		.get(config.ids.channelIDs.dev.botTestLobby)
		.send({ embeds: [loginMessage] }) //sends login embed to channel
}
