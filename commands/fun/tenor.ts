// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { EmbedBuilder, Message, MessageMentions, UserMention } from 'discord.js'
import { DiscordClient, DiscordMessage } from '../../types/customTypes'

exports.name = 'tenor'

exports.description = 'send gifs'

exports.usage = `tenor <searchQuery>`

exports.aliases = ['gif']

exports.run = (client: DiscordClient, message: DiscordMessage, args: string[]) => {
  /**
   * Get {@link UserMention} from message.
   * @type {string}
   */
  const userPing = args.find(value => MessageMentions.UsersPattern.test(value))

  /**
   * Define search query.
   */
  const searchQuery = removeMatching(args, MessageMentions.UsersPattern).join(' ')

  /**
   * Send reply.
   */
  return searchQuery.length === 0
    ? client.send(message, {
        content: client.translate({ key: 'commands.fun.tenor.ErrorMissingSearchQuery', lng: message.author.language }),
      })
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
 * @param {DiscordMessage} message Command-message to respond to
 * @param {string} userPing User to mention
 * @returns {any}
 */
function queryTenorAndReply(
  client: DiscordClient,
  searchQuery: string,
  message: DiscordMessage,
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
     * New {@link EmbedBuilder} with random color.
     *
     * {@link EmbedBuilderFooter} is set to the user's tag and avatar who issued the command.
     */
    let embed = new EmbedBuilder().setColor('Random').setFooter({
      text: message.author.tag,
      iconURL: message.author.avatarURL(),
    })

    /**
     * Set image of embed if Tenor query returned any.
     * If no results have been returned, set Description to tell user that nothing has been found.
     */
    // ? embed.setDescription(`<@${message.author.id}> Es konnten keine Gifs gefunden werden für: '${searchQuery}'`)
    embed =
      Results.length === 0
        ? embed.setDescription(
            client.translate({
              key: 'commands.fun.tenor.ErrorNoGifsFound',
              options: { userID: message.author.id, searchQuery: searchQuery, lng: message.author.language },
            }),
          )
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
