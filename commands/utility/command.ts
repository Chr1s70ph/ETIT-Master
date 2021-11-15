import { Message, MessageEmbed } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'

exports.name = 'command'

exports.description = 'Dieser Befehl zeigt eine Befehlshilfe an.'

exports.usage = 'command {COMMAND}'

exports.example = 'command test'

exports.aliases = ['commandinfo']

/**
 *
 * @param {Object} client discord bot client
 * @param {Object} message message object
 * @param {Array} args arguments of issued command
 * @returns {any} commandHelpEmbed with description, example and name of command
 */
exports.run = (client: DiscordClient, message: Message, args: any): any => {
  const commandHelpEmbed = new MessageEmbed()
    .setColor('#7289ea')
    .setAuthor('Befehlshilfe', 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Lol_question_mark.png')
    .setThumbnail(client.user.avatarURL())

  if (args.length === 0) {
    return client.commandSendPromise(message, { content: 'Please provide arguments!' })
  }

  for (const [key, value] of client.commands.entries()) {
    if (key === args[0].toLowerCase() || findAliases(value.aliases, args)) {
      if (value.aliases && value.aliases.length > 0) {
        addAliasesToEmbed(value.aliases, commandHelpEmbed)
      }

      commandHelpEmbed.setTitle(`‎${value.name}\n ‎`)
      commandHelpEmbed.addFields(
        {
          name: 'Beschreibung',
          value: `${value.description}\n‎ ‎`,
          inline: false,
        },
        {
          name: 'Benutzung:',
          value: `${client.config.prefix}${value.usage}\n ‎`,
          inline: false,
        },
      )
      return client.commandReplyPromise(message, { embeds: [commandHelpEmbed] })
    }
  }

  return client.commandSendPromise(message, { content: 'Bitte verwende einen Commandnamen.' })
}

/**
 * Returns aliases if command has defined aliases
 * @param {Array} aliasesArray array of aliases exported
 * @param {Array} args arguments of issued command
 * @returns {boolean} array of aliases
 */
function findAliases(aliasesArray: any, args: any): boolean {
  if (Array.isArray(aliasesArray) && aliasesArray.length > 0) {
    return aliasesArray.some(commandName => commandName.toLowerCase() === args[0].toLowerCase())
  } else {
    return false
  }
}

/**
 *
 * @param {Array} aliasesArray array of aliases exported
 * @param {Object} commandHelpEmbed command embed
 * @param {Array} args arguments of issued command
 * @returns {MessageEmbed} commandHelpEmbed with added aliases
 */
function addAliasesToEmbed(aliasesArray: any, commandHelpEmbed: any): MessageEmbed {
  const aliasesString = aliasesArray.toString()
  commandHelpEmbed.addFields({
    name: 'Aliase',
    value: `${aliasesString}\n `,
    inline: false,
  })

  return commandHelpEmbed
}
