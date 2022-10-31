import { EmbedBuilder } from 'discord.js'
import { DiscordClient, DiscordMessage } from '../types/customTypes'

exports.run = (client: DiscordClient, message: DiscordMessage) => {
  /**
   * Only respond to messages sent by users.
   */
  if (message.author.bot) return

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
