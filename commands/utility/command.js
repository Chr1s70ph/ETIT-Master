const discord = require("discord.js")
const config = require("../../private/config.json")

exports.name = "command"

exports.description = "Dieser Befehl zeigt eine Befehlshilfe an."

exports.usage = `${config.prefix}command {COMMAND}`

exports.example = `${config.prefix}command test`

exports.aliases = ["commandinfo"]

/**
 *
 * @param {object} client discord bot client
 * @param {object} message message object
 * @param {array} args arguments of issued command
 * @returns commandHelpEmbed with description, example and name of command
 */
exports.run = async (client, message, args) => {
	let commandHelpEmbed = new discord.MessageEmbed()
		.setColor("#7289ea")
		.setAuthor(
			"Befehlshilfe",
			"https://upload.wikimedia.org/wikipedia/commons/f/f6/Lol_question_mark.png"
		)
		.setThumbnail(client.user.avatarURL())

	if (args[0] == undefined) {
		return message.channel.send("Please provide arguments!")
	}

	for (let [key, value] of client.commands.entries()) {
		if (key == args[0].toLowerCase() || findAliases(value.aliases, args)) {
			if (value.aliases && value.aliases.length > 0) {
				addAliasesToEmbed(value.aliases, commandHelpEmbed)
			}

			commandHelpEmbed.setTitle(`‎${value.name}\n ‎`)
			commandHelpEmbed.addFields(
				{
					name: "Beschreibung",
					value: `${value.description}\n‎ ‎`,
					inline: false
				},
				{
					name: "Benutzung:",
					value: `${client.config.prefix}${value.usage}\n ‎`,
					inline: false
				}
			)
			return message.channel.send({ embeds: [commandHelpEmbed] })
		}
	}

	return message.channel.send("Bitte verwende einen Commandnamen.")
}

/**
 * returns aliases if command has defined aliases
 * @param {array} aliasesArray array of aliases exported
 * @param {array} args arguments of issued command
 * @returns array of aliases
 */
function findAliases(aliasesArray, args) {
	if (Array.isArray(aliasesArray) && aliasesArray.length > 0) {
		return aliasesArray.some(
			(commandName) => commandName.toLowerCase() === args[0].toLowerCase()
		)
	} else return false
}

/**
 *
 * @param {array} aliasesArray array of aliases exported
 * @param {object} commandHelpEmbed command embed
 * @param {array} args arguments of issued command
 * @returns commandHelpEmbed with added aliases
 */
function addAliasesToEmbed(aliasesArray, commandHelpEmbed) {
	let aliasesString = aliasesArray.toString()
	commandHelpEmbed.addFields({
		name: "Aliase",
		value: `${aliasesString}\n `,
		inline: false
	})

	return commandHelpEmbed
}
