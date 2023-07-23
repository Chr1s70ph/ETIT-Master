import { EmbedBuilder, TextChannel } from 'discord.js'
import textgears from 'textgears-api'
import { DiscordClient, DiscordMessage } from '../types/customTypes'

exports.run = async (client: DiscordClient, message: DiscordMessage) => {
  /**
   * Only respond to messages sent by users.
   */
  if (message.author.bot) return

  /**
   * OpenAI's Chat-GPT
   */
  if (message.channel.isThread() && message.channel.name === 'chat-gpt') {
    message.channel.sendTyping()
    try {
      const completion = await client.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message.content.toString() }],
      })

      message.channel.send(completion.data.choices[0].message.content.toString())
    } catch (error) {
      if (error.response) {
        console.log(`Error status: ${error.response.status}`)
        console.log(`Error data: ${error.response.data}`)
      } else {
        console.log(`Error message: ${error.message}`)
      }
    }
  }

  /**
   * Annoy people :)
   */
  const channel = message.channel as TextChannel
  if (channel.parentId === '773683524833902632' && message.author.id === client.config.ids.userID.david) {
    check_spelling(client, message)
  }

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

  const textgearsApi = textgears(client.config.sensitive.textgears_api_key, { language: 'de-DE', ai: false })
  textgearsApi
    .checkGrammar(test_query)
    .then(async return_data => {
      if (return_data.response.errors.length > 0) {
        /**
         * Message to do better next time
         */
        await message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('⚠FEHLER ENTDECKT!!⚠')
              .setThumbnail('https://www.duden.de/modules/custom/duden_og_image/images/Duden_FB_Profilbild.jpg')
              .setDescription('Das nächste Mal bitte vorher auf Rechtschreibung überprüfen'),
          ],
        })
        /**
         * Loop over all suggestions
         */
        for (const error of return_data.response.errors) {
          /**
           * Nicely formatted list of links to duden.de entries
           */
          let suggestion_links = `__Verbesserungen__:\n`
          for (const suggestion of error.better) {
            suggestion_links += `- **__[${suggestion}](https://duden.de/rechtschreibung/${suggestion})__**\n`
          }
          /**
           * Send embed with all the suggestions for one error
           */
          const embed = new EmbedBuilder()
            .setTitle(`Fehler: ${error.bad}`)
            .setAuthor({
              name: '⚠Fehler Verbesserung⚠',
              iconURL: 'https://www.duden.de/modules/custom/duden_og_image/images/Duden_FB_Profilbild.jpg',
            })
            .setThumbnail('https://www.duden.de/modules/custom/duden_og_image/images/Duden_FB_Profilbild.jpg')
            .setDescription(suggestion_links)
            .setFooter({
              text: 'Du hast einen physischen Duden, also nutze ihn ;)',
            })
            .setTimestamp()
          // eslint-disable-next-line no-await-in-loop
          await message.reply({ embeds: [embed] })
        }
      }
    })
    .catch(err => {
      throw new Error(err)
    })
}
