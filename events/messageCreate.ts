import { EmbedBuilder } from 'discord.js'
import textgears from 'textgears-api'
import { DiscordClient, DiscordMessage } from '../types/customTypes'

exports.run = (client: DiscordClient, message: DiscordMessage) => {
  /**
   * Only respond to messages sent by users.
   */
  if (message.author.bot) return

  /**
   * Annoy people :)
   */
  if (message.author.id === client.config.ids.userID.david) check_spelling(client, message)

  /**
   * DM handling and forwarding.
   */
  if (message.guildId === null) {
    /**
     * Payload containing info about the user and the message he sent.
     */
    const messagePayload = {
      type: 'USER_DM',
      user: message.author,
      content: message.content,
      sticker: message.stickers.size > 0 ? message.stickers.first() : null,
      attachments: message.attachments.size > 0 ? message.attachments.first().url : null,
    }

    try {
      /**
       * Send {@link userMessage} to Christoph.
       */
      client.users.fetch(client.config.ids.acceptedAdmins.Christoph).then(user => {
        user.send({
          embeds: [
            new EmbedBuilder()
              .setDescription(
                message.content +
                  (messagePayload.sticker !== null
                    ? `${`\n${message.content ? 'and' : 'Sent'} a sticker: + **`}${messagePayload.sticker.name}**`
                    : ''),
              )
              .setAuthor({ name: message.author.tag, iconURL: message.author.avatarURL() })
              .setImage(messagePayload.attachments),
          ],
        })
      })
      console.log(messagePayload)
    } catch (error) {
      /**
       * Error handling.
       */
      throw new Error(error)
    }
  }
}

/**
 * Just a small function to annoy a friend ;)
 * @param {Discordlient} client Discord-Client
 * @param {DiscordMessage} message Message to scan
 */
function check_spelling(client: DiscordClient, message: DiscordMessage) {
  const test_query = message.toString()

  const textgearsApi = textgears(client.config.textgears_api_key, { language: 'de-DE', ai: false })
  textgearsApi
    .checkGrammar(test_query)
    .then(async return_data => {
      console.log(return_data.response.errors.length)
      if (return_data.response.errors.length > 0) {
        await message.reply('FEHLER ENTDECKT!!')
        for (const error of return_data.response.errors) {
          // eslint-disable-next-line no-await-in-loop
          await message.reply(`Error: ${error.bad}. Suggestions: ${error.better.join(', ')}`)
        }
      }
    })
    .catch(err => {
      console.log(err)
    })
}
