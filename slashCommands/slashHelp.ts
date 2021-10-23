const { log } = require("console")
const fs = require("fs")
var discord = require("discord.js")
const config = require("../private/config.json")

exports.run = async (client) => {
	let embed = await getCommands()

	await client.api.applications(client.user.id).commands.post({
		data: {
			name: "help",
			description: "hilfe ist hier"
		}
	})

	client.ws.on("INTERACTION_CREATE", async (interaction) => {
		if (interaction.type != "2") return //type 2 interactions are slashcommands
		const command = interaction.data.name.toLowerCase()
		const args = interaction.data.options
		if (command === "help") {
			console.log("User " + interaction.member.user.username + " issued /help")

			await client.api.interactions(interaction.id, interaction.token).callback.post({
				data: {
					type: 4, //https://discord.com/developers/docs/interactions/slash-commands#interaction-response-interactionresponsetype
					data: {
						embeds: [embed.setTimestamp()],
						flags: 64
					}
				}
			})
		}
	})

	async function getCommands() {
		let commandsEmbed = new discord.MessageEmbed() //Login Embed
			.setColor("#ffa500")
			.setAuthor(
				"Help",
				"https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/google/56/white-question-mark-ornament_2754.png"
			)
			.setTimestamp()
			.setFooter(
				`[ID] ${config.ids.userID.botUserID} \nstarted`,
				"https://image.flaticon.com/icons/png/512/888/888879.png"
			)

		//get all enteties from folder
		let commandFiles = await fs.promises.readdir("./commands/", (err, elements) => {
			if (err) return console.log(err)
		})

		let commandsInFolder = " "
		for (const file of commandFiles) {
			const element_in_folder = fs.statSync(`./commands/${file}`)
			if (element_in_folder.isDirectory()) {
				//check if element in folder is a subfolder
				await addCommandsFromSubFolder(commandsEmbed, file)
			} else {
				let slicedFileName = file.split(".js")[0]
				commandsInFolder += slicedFileName + "\n"
			}
		}

		return commandsEmbed //return full object with all commands

		async function addCommandsFromSubFolder(commandsEmbed, file) {
			const sub_directory = `./commands/${file}/`
			try {
				const files = await fs.promises.readdir(sub_directory)
				let commandsInSubfolder = " "
				for (const command of files) {
					let slicedFileName = command.split(".js")[0]
					commandsInSubfolder += slicedFileName + "\n"
				}
				commandsEmbed.addFields({
					name: file,
					value: commandsInSubfolder,
					inline: true
				})
			} catch (e) {
				console.log(e)
			}
		}
	}
}
