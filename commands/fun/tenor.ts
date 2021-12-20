// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MessageEmbed, Message, MessageMentions, UserMention, MessageEmbedFooter } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'

exports.name = 'tenor'

exports.description = 'send gifs'

exports.usage = `tenor <searchQuery>`

exports.aliases = ['gif']

exports.run = (client: DiscordClient, message: Message, language: string, args: string[]) => {
  /**
   * Get {@link UserMention} from message.
   * @type {string}
   */
  const userPing = args.find(value => MessageMentions.USERS_PATTERN.test(value))

  /**
   * Define search query.
   */
  const searchQuery = removeMatching(args, MessageMentions.USERS_PATTERN).join(' ')

  /**
   * Send reply.
   */
  return searchQuery.length === 0
    ? client.send(message, { content: 'Bitte gebe einen suchwort an!' })
    : queryTenorAndReply(client, searchQuery, message, userPing)
}

/**
 * Derived from https://stackoverflow.com/a/3661083/10926046
 * @param {string[]} originalArray Array to get string from
 * @param {RegExp} regex RegularExpression to look for
 * @returns {string} String extracted from Array
 */
function removeMatching(originalArray: string[], regex: RegExp): string[] {
  let iterator = 0
  while (iterator < originalArray.length) {
    if (regex.test(originalArray[iterator])) originalArray.slice(iterator, 1)
    else iterator++
  }
  return originalArray
}

/**
 * Query the Tenor-API and send a reply with a random GIF.
 * @param {DiscordClient} client Bot-Client.
 * @param {string} searchQuery Query to search for with the tenor api
 * @param {Message<boolean>} message Command-message to respond to
 * @param {string} userPing User to mention
 * @returns {any}
 */
function queryTenorAndReply(
  client: DiscordClient,
  searchQuery: string,
  message: Message<boolean>,
  userPing: string,
): any {
  /**
   * Create instance of the tenorjs wrapper.
   */
  const Tenor = require('tenorjs').client(client.config.tenor)

  /**
   * Query the Tenor-API for one random GIF.
   */
  return Tenor.Search.Random(searchQuery, '1').then(Results => {
    /**
     * New {@link MessageEmbed} with random color.
     *
     * {@link MessageEmbedFooter} is set to the user's tag and avatar who issued the command.
     */
    let embed = new MessageEmbed()
      .setColor('RANDOM')
      .setFooter(message.author.tag, message.author.avatarURL({ dynamic: true }))

    /**
     * Set image of embed if Tenor query returned any.
     * If no results have been returned, set Description to tell user that nothing has been found.
     */
    embed =
      Results.length === 0
        ? embed.setDescription(`<@${message.author.id}> Es konnten keine Gifs gefunden werden für: '${searchQuery}'`)
        : embed.setImage(Results[0].media.find(element => Object.prototype.hasOwnProperty.call(element, 'gif')).gif.url)

    /**
     * Send back {@link embed} with {@link userPing}
     */
    return client.send(message, {
      content: userPing,
      embeds: [embed],
    })
  })
}
