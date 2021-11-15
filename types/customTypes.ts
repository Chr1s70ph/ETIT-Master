// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Client, Message, TextChannel, MessageOptions } from 'discord.js'

export class DiscordClient extends Client {
  public commands
  public config
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
  public commandSendPromise(message: Message, returnData: MessageOptions) {
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
  public commandReplyPromise(message: Message, returnData: MessageOptions, optionalReplyMessage?: Message) {
    const replyMessage = optionalReplyMessage ?? message
    return new Promise<Message>((resolve, reject) => {
      replyMessage.reply(returnData).then(
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
