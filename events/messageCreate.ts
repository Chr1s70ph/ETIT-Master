import { EmbedBuilder, MessageCreateOptions, MessagePayload, TextChannel } from 'discord.js'
import tx2 from 'tx2'
import { DiscordClient, DiscordMessage } from '../types/customTypes'

/**
 * Custom PM2 metric.
 */
const openai_api_requests = tx2.counter('OpenAI-API Requests')

exports.run = (client: DiscordClient, message: DiscordMessage) => {
  /**
   * Only respond to messages sent by users.
   */
  if (message.author.bot) return

  /**
   * OpenAI's Chat-GPT
   */
  if (message.channel.isThread() && message.channel.name === 'chat-gpt') {
    try {
      let requestDone = false
      let openai_api_request_sent = false

      console.log(`Chat-GPT request, by: ${message.author.username}`)
      /**
       * Function to wait for the API response and send typing.
       */
      const awaiting_api_reposonse = () => {
        setTimeout(() => {
          /**
           * Send typing indicator.
           */
          message.channel.sendTyping()

          if (openai_api_request_sent === false) {
            openai_api_request_sent = true
            client.openai.chat.completions
              .create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: message.content.toString() }],
              })
              .then(request => {
                /**
                 * Set requestDone to true, so the request doesn't get sent again.
                 */
                requestDone = true

                /**
                 * Split the message into multiple messages if it's too long.
                 */
                splitMessageRegex(request.choices[0].message.content.toString(), {
                  maxLength: 2000,
                  prepend: '',
                  append: '',
                }).forEach((element: string | MessagePayload | MessageCreateOptions) => {
                  message.channel.send(element)
                })

                openai_api_requests.inc(1)
                console.log(`Chat-GPT request done. Request by: ${message.author.username}`)
              })
          }
          if (requestDone === false) {
            /**
             * If the request is not done, wait 1 second and send typing again.
             */
            awaiting_api_reposonse()
          }
        }, 1000)
      }

      awaiting_api_reposonse()
    } catch (error) {
      if (error.response) {
        console.log(`Error status: ${error.response.status}`)
        console.log(`Error data: ${error.response.data}`)
        message.channel.send(
          client.translate({
            key: 'interactions.chatgpt.error',
            options: {
              error_status: error.response.status,
              error_data: error.response.data,
              lng: message.author.language,
            },
          }),
        )
      } else {
        console.log(`Error message: ${error.message}`)
      }
    }
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
 * A function for splitting a string into fixed-length parts. Designed as a
 * workaround to an issue in the discord.js Util.splitMessage function
 * https://github.com/discordjs/discord.js/issues/7674
 * @param {string} text The string to split into multiple messages, each of
 * which will be no longer than maxLength
 * @param {number} [options.maxLength] The maximum number of characters in each
 * string in the returned array
 * @param {RegExp} [options.regex] A global regex which matches the delimeters on
 * which to split text when needed to keep each part within maxLength
 * @param {string} [options.prepend] A string to add before each part iff
 * text is split into multiple parts
 * @param {string} [options.append] A string to add after each part iff text
 * is split into multiple parts
 * @returns {string[]} An array of strings which are substrings of text, split
 * using options.regex, combined such that each part is as long as possible
 * while not exceeding options.maxLength.
 */
function splitMessageRegex(
  text: string,
  {
    maxLength = 2_000,
    regex = /\n/g,
    prepend = '',
    append = '',
  }: { maxLength?: number; regex?: RegExp; prepend?: string; append?: string } = {},
): any[] {
  if (text.length <= maxLength) return [text]
  const parts = []
  let curPart = prepend
  let chunkStartIndex = 0

  let prevDelim = ''

  function addChunk(chunkEndIndex: number, nextDelim: string) {
    const nextChunk = text.substring(chunkStartIndex, chunkEndIndex)
    const nextChunkLen = nextChunk.length

    // If a single part would exceed the length limit by itself, throw an error:
    if (prepend.length + nextChunkLen + append.length > maxLength) {
      throw new RangeError('SPLIT_MAX_LEN')
    }

    // The length of the current part if the next chunk were added to it:
    const lengthWithChunk = curPart.length + prevDelim.length + nextChunkLen + append.length

    // If adding the next chunk to the current part would cause it to exceed
    // the maximum length, push the current part and reset it for next time:
    if (lengthWithChunk > maxLength) {
      parts.push(curPart + append)
      curPart = prepend + nextChunk
    } else {
      curPart += prevDelim + nextChunk
    }
    prevDelim = nextDelim
    chunkStartIndex = chunkEndIndex + prevDelim.length
  }

  for (const match of text.matchAll(regex)) {
    addChunk(match.index, match[0])
  }
  addChunk(text.length - 1, '')
  parts.push(curPart + append)
  return parts
}
