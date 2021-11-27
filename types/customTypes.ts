// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Client, Message, TextChannel, MessageOptions, Collection } from 'discord.js'

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
    youtube: string
    youtubedev: string
    poker: string
    betrayal: string
    fishing: string
    chess: string
    chessdev: string
    lettertile: string
    wordsnack: string
    doodlecrew: string
    awkword: string
    spellcast: string
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
