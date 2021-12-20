import { readdirSync } from 'fs'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Client, Message, TextChannel, MessageOptions, Collection } from 'discord.js'
import i18next from 'i18next'

/**
 * Extended version of the default {@link Client} with addidtional functions and properties.
 * @extends { Client}
 */
export class DiscordClient extends Client {
  /**
   * Collection of all commands to use
   * @type {Collection<string, Command>}
   */
  public commands: Collection<string, Command>

  /**
   * Config file imported into the DiscordClient for global access
   * @type { [key: string]: any }
   */
  public config: { [key: string]: any }

  /**
   * Object with ids of discord-games
   */
  public applications: {
    awkword: string
    betrayal: string
    checkers: string
    chess: string
    chessdev: string
    doodlecrew: string
    fishing: string
    lettertile: string
    poker: string
    puttparty: string
    sketchyartist: string
    spellcast: string
    wordsnack: string
    youtube: string
    youtubedev: string
  }

  /**
   * Uses {@link TextChannel.send()} to reply to the issued command.
   * @param {Message} message message to answer to
   * @param {MessageOptions} returnData data to be sent back as answer
   * @returns {Message} original command message
   */
  public send(message: Message, returnData: MessageOptions): Promise<Message<boolean>> {
    return new Promise<Message>((resolve, reject) => {
      message.channel.send(returnData).then(
        () => {
          resolve(message)
        },
        error => {
          reject(error)
        },
      )
    })
  }

  /**
   * Uses {@link Message.reply()} to reply to the issued command.
   * @param {Message} message message to ryply to
   * @param {MessageOptions} returnData data to be sent back as answer
   * @param {Message} [optionalReplyMessage] to reply to, instead of command message
   * @returns {Message} original command message
   */
  public reply(message: Message, returnData: MessageOptions): Promise<Message<boolean>> {
    return new Promise<Message>((resolve, reject) => {
      if (message.type === 'REPLY') {
        return message.channel.messages
          .fetch(message.reference.messageId)
          .then(_message => {
            _message.reply(returnData)
            return message
          })
          .then(
            () => {
              resolve(message)
            },
            error => {
              reject(error)
            },
          )
      }
      return message.reply(returnData).then(
        () => {
          resolve(message)
        },
        error => {
          reject(error)
        },
      )
    })
  }

  /**
   * Get user language.
   * @param  {Message} message Message sent by user
   * @returns {string}
   */
  public getLanguage(message: Message): string {
    /**
     * List of all defined languages in './locales/'.
     */
    const files = readdirSync('./locales/')

    /**
     * Loop through all languages.
     */
    for (const file of files) {
      /**
       * Remove '.json' filetype from file name
       */
      const language = file.split('.')[0]

      /**
       * Return language if match is found.
       */
      if (message.member.roles.cache.some(role => role.name === language)) return language
    }

    /**
     * Return null if no language match is found.
     */
    return null
  }

  /**
   * Translate {@link translation_options.key} using {@link translation_options.lng}
   * or alternatively {@link translation_options.options}.
   * @param  {translation_options} args Arguments to use to translate
   * @returns {string}
   */
  public translate(args: translation_options): string {
    const options = args.options ?? args.lng ? { lng: args.lng } : null
    return i18next.t(args.key, options)
  }
}

/**
 * Interface for translation parameters
 * @readonly
 * @private
 */
interface translation_options {
  key: string | string[]
  lng?: string
  options?: object | string
}

/**
 * Interface of Command structure
 * @readonly
 * @private
 */
interface Command extends Object {
  name: string
  description: string
  usage: string
  example: string
  aliases: string[]
}
