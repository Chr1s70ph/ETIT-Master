// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Client, Message, TextChannel, MessageOptions } from 'discord.js'

export class DiscordClient extends Client {
  public commands
  public config
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
}
