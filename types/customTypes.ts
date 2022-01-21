import { readdirSync } from 'fs'
import {
  Client,
  Message,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TextChannel,
  Interaction,
  MessageOptions,
  Collection,
  User,
  GuildMemberRoleManager,
  CommandInteraction,
  AutocompleteInteraction,
  ButtonInteraction,
  SelectMenuInteraction,
  ApplicationCommand,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
} from 'discord.js'
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
   * Collection of all interactions to use
   * @type {Collection<string, InteractionCommands>}
   */
  public interactions: Collection<string, InteractionCommands>

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
      /**
       * 19 represents reply type
       */
      if (message.type === 19) {
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
   * @param {DiscordInteraction} interaction Interaction used by user
   * @returns {string}
   */
  public getLanguage(message?: DiscordMessage, interaction?: Interaction): string {
    /**
     * Object of {@link DiscordUser}
     */
    const user = message ? message.author : (interaction.user as DiscordUser)

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
      if (message) {
        if (message.member?.roles?.cache.some(role => role.name === language)) {
          return (user.language = language)
        }
      } else if (interaction) {
        const userRoles = interaction.member.roles as GuildMemberRoleManager
        if (userRoles.cache.some(role => role.name === language)) {
          return (user.language = language)
        }
      }
    }

    /**
     * Return default language if no language match is found.
     */
    return (user.language = 'en')
  }

  /**
   * Translate {@link translation_options.key} using {@link translation_options.lng}
   * or alternatively {@link translation_options.options}.
   * @param  {translation_options} args Arguments to use to translate
   * @returns {string}
   */
  public translate(args: translation_options): string {
    const options = args.options ?? { lng: args.lng ?? 'en' }
    return i18next.t(args.key, options)
  }
}

/**
 * Extended Message to hold {@link DiscordUser}.
 */
export interface DiscordMessage extends Message {
  author: DiscordUser
}

/**
 * Extended {@link AutocompleteInteraction} to hold {@link DiscordUser}
 */
export interface DiscordAutocompleteInteraction extends AutocompleteInteraction {
  user: DiscordUser
}

/**
 * Extended {@link ButtonInteraction} to hold {@link DiscordUser}
 */
export interface DiscordButtonInteraction extends ButtonInteraction {
  user: DiscordUser
}

/**
 * Extended {@link CommandInteraction} to hold {@link DiscordUser}
 */
export interface DiscordCommandInteraction extends CommandInteraction {
  user: DiscordUser
}

/**
 * Extended {@link MessageContextMenuInteraction} to hold {@link DiscordUser}
 */
export interface DiscordMessageContextMenuCommandInteraction extends MessageContextMenuCommandInteraction {
  user: DiscordUser
}

/**
 * Extended {@link SelectMenuInteraction} to hold {@link DiscordUser}
 */
export interface DiscordSelectMenuInteraction extends SelectMenuInteraction {
  user: DiscordUser
}

/**
 * Extended {@link UserContextMenuInteraction} to hold {@link DiscordUser}
 */
export interface DiscordUserContextMenuCommandInteraction extends UserContextMenuCommandInteraction {
  user: DiscordUser
}

/**
 * Extended User to hold language.
 */
export interface DiscordUser extends User {
  language: string
}

/**
 * Interface for translation parameters
 */
interface translation_options {
  key: string | string[]
  lng?: string
  options?: object | string
}

/**
 * Interface of Command structure
 */
interface Command extends Object {
  name: string
  description: string
  usage: string
  example: string
  aliases: string[]
}

interface InteractionCommands extends Object {
  name: string
  description: string
  usage: string
  Autocomplete?: any
  Button?: any
  Command?: any
  MessageContextMenu?: any
  SelectMenu?: any
  UserContextMenu?: any
}

/**
 * Extended {@link ApplicationCommand} to hold {@link DiscordUser}
 */
export interface DiscordApplicationCommand extends ApplicationCommand {
  user: DiscordUser
}
