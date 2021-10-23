import { DiscordClient } from "../../index"
import { Message, MessageEmbed } from "discord.js"

exports.name = "command"

exports.description = "Dieser Befehl zeigt eine Befehlshilfe an."

exports.usage = "command {COMMAND}"

exports.example = "command test"

exports.aliases = ["commandinfo"]

/**
 *
 * @param {object} client discord bot client
 * @param {object} message message object
 * @param {array} args arguments of issued command
 * @returns commandHelpEmbed with description, example and name of command
 */
exports.run = async (client: DiscordClient, message: Message, args: any) => {
	let commandHelpEmbed = new MessageEmbed()
		.setColor("#7289ea")
		.setAuthor(
			"Befehlshilfe",
			"https://upload.wikimedia.org/wikipedia/commons/f/f6/Lol_question_mark.png"
		)
		.setThumbnail(client.user.avatarURL())

	if (args.length === 0) {
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
function findAliases(aliasesArray: any, args: any) {
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
function addAliasesToEmbed(aliasesArray: any, commandHelpEmbed: any) {
	let aliasesString = aliasesArray.toString()
	commandHelpEmbed.addFields({
		name: "Aliase",
		value: `${aliasesString}\n `,
		inline: false
	})

	return commandHelpEmbed
}
