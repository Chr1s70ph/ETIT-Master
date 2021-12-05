import { Message, MessageEmbed } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'

exports.name = 'command'

exports.description = 'Dieser Befehl zeigt eine Befehlshilfe an.'

exports.usage = 'command {COMMAND}'

exports.example = 'command test'

exports.aliases = ['commandinfo']

exports.run = (client: DiscordClient, message: Message, args: any): any => {
  /**
   * Check if user provided a command name.
   */
  if (args.length === 0) return client.send(message, { content: 'Please provide arguments!' })

  for (const [key, value] of client.commands.entries()) {
    if (key === args[0].toLowerCase() || findAliases(value.aliases, args)) {
      const commandHelpEmbed = createEmbed(value, client)
      return client.reply(message, { embeds: [commandHelpEmbed] })
    }
  }

  return client.send(message, { content: 'Bitte verwende einen Commandnamen.' })
}

/**
 * Creates an Embed with the provided information.
 * @param {any} value Information about the command
 * @param {DiscordClient} client Bot-Client
 * @returns {MessageEmbed}
 */
function createEmbed(value: any, client: DiscordClient): MessageEmbed {
  /**
   * Embed with command information.
   */
  const embed = new MessageEmbed()
    .setColor('#7289ea')
    .setAuthor({ name: 'Befehlshilfe', iconURL: 'https://bit.ly/30ZO6jh' })
    .setThumbnail(client.user.avatarURL())
    .setTitle(`‎${value.name}\n ‎`)

  /**
   * Loop through all aliases of the command and add them to the Embed.
   */
  if (value.aliases && value.aliases.length > 0) {
    addAliasesToEmbed(value.aliases, embed)
  }

  /**
   * Add description and use instructions to the embed.
   */
  embed.addFields(
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

  return embed
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
 * @param {Object} embed command embed
 * @param {Array} args arguments of issued command
 * @returns {MessageEmbed} commandHelpEmbed with added aliases
 */
function addAliasesToEmbed(aliasesArray: any, embed: any): MessageEmbed {
  /**
   * String of aliases seperated by commas.
   */
  const aliasesString = aliasesArray.join(', ')

  /**
   * Add the string of aliases to {@link embed}
   */
  embed.addFields({
    name: 'Aliase',
    value: `${aliasesString}\n `,
    inline: false,
  })

  return embed
}
