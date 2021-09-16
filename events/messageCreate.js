const config = require("../private/config.json")
const discord = require("discord.js")
var prefix = config.prefix

exports.run = async (client, message) => {
	if (message.author.bot) return
	if (message.guildId === null) {
		let userMessage = new discord.MessageEmbed().setDescription(message.content || "᲼")
		let messageAttachment =
			message.attachments.size > 0 ? message.attachments.first().url : null
		userMessage.setImage(messageAttachment)
		client.users.fetch(config.ids.acceptedAdmins.Christoph, false).then((user) => {
			user.send({
				content: `User <@${message.author.id}> said:`,
				embeds: [userMessage]
			})
		})
		console.log(
			`User ${message.author.tag} sent a DM: ${message.content || "without content"}`
		)
	}
	if (message.content.startsWith(prefix)) {
		let messageArray = message.content.split(" "),
			commandName = messageArray[0],
			args = messageArray.slice(1)
		commandName = commandName.slice(prefix.length).toLowerCase()

		commandfile =
			client.commands.get(commandName) ||
			client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

		if (commandfile == undefined) return
		try {
			message.channel.sendTyping()
			commandfile.run(client, message, args).then(message.delete())
			console.log(
				`${message.author.username} used ${commandName} ${
					args.length > 0 ? `with arguments: ${args}` : ""
				}`
			)
		} catch (error) {
			console.error(error)
		}
	}
}
