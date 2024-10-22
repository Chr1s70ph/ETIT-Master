import { readdirSync } from 'fs'
import {
  ApplicationCommand,
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  Collection,
  ContextMenuCommandInteraction,
  Interaction,
  LocaleString,
  Message,
  MessageComponentInteraction,
  MessageContextMenuCommandInteraction,
  MessageCreateOptions,
  MessageType,
  ModalSubmitInteraction,
  PresenceData,
  PresenceStatusData,
  StringSelectMenuInteraction,
  TextChannel,
  User,
  UserContextMenuCommandInteraction,
  SlashCommandBuilder  
} from 'discord.js'
import i18next, { TOptions } from 'i18next'
import { CalendarResponse } from 'node-ical'

/**
 * Extended version of the default {@link Client} with addidtional functions and properties.
 * @extends { Client}
 */
export class DiscordClient extends Client {
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
   * Global cache for calendars
   * @type {Collection<string, CalendarResponse>}
   */
  public calendars: Collection<string, CalendarResponse>

  /**
   * Config file imported into the DiscordClient for global access
   * @type {[key: string]: any}
   */
  public config: {
    settings: config_settings_typing
    sensitive: config_sensitive_typing
    ids: config_ids_typing
  }

  /**
   * Global {@link customPresence} of client
   * @type {PresenceData | null}
   */
  public customPresence: PresenceData | null

  public maintenanceMode: boolean

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
      } else if (interaction && interaction.locale === language) {
        return (user.language = language)
      }
    }
    /**
     * Return default language if no language match is found.
     */
    return (user.language = 'en-US')
  }

  /**
   * Collection of all interactions to use
   * @type {Collection<string, InteractionCommands>}
   */
  public interactions: Collection<string, InteractionCommands>

  /**
   * Uses {@link Message.reply()} to reply to the issued command.
   * @param {Message} message message to ryply to
   * @param {MessageCreateOptions} returnData data to be sent back as answer
   * @param {Message} [optionalReplyMessage] to reply to, instead of command message
   * @returns {Message} original command message
   */
  public reply(message: Message, returnData: MessageCreateOptions): Promise<Message<boolean>> {
    return new Promise<Message>((resolve, reject) => {
      if (message.type === MessageType.Reply) {
        const channel = message.channel as TextChannel
        return channel.messages
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
   * Uses {@link TextChannel.send()} to reply to the issued command.
   * @param {Message} message message to answer to
   * @param {MessageCreateOptions} returnData data to be sent back as answer
   * @returns {Message} original command message
   */
  public send(message: Message, returnData: MessageCreateOptions): Promise<Message<boolean>> {
    return new Promise<Message>((resolve, reject) => {
      const channel = message.channel as TextChannel
      channel.send(returnData).then(
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
   * Translate {@link translation_options.key} using {@link translation_options.lng}
   * or alternatively {@link translation_options.options}.
   * @param  {translation_options} args Arguments to use to translate
   * @returns {string}
   */
  public translate(args: translation_options): string {
    // Const options = args.options ?? { lng: args.lng ?? 'en-US' }
    return i18next.t(args.key, args.options)
  }
}

/**
 * Slashcommand Localization need a name and a description.
 * This function returns an {@link Array} of all localized names and descriptions
 * @param {string} name  name of command or interaction
 * @returns {Array<LocalizationTranslations>} Array with translations for all localizations
 */
export function getLocalizations(name: string): Array<LocalizationTranslations> {
  /**
   * Array to hold all translations
   */
  const returnValue: Array<LocalizationTranslations> = []
  /**
   * Loop through all loaded {@link i18next} fallbacklanguages
   */
  for (const language of i18next.languages) {
    /**
     * Add translations to object in Array
     */
    returnValue[language] = {
      localized_language: language,
      localized_name: i18next.t(`interactions.${name}.localized_name`, { defaultValue: null, lng: language }),
      localized_description: i18next.t(`interactions.${name}.localized_description`, {
        lng: language,
        defaultValue: null,
      }),
    }
  }
  return returnValue
}

export class DiscordSlashCommandBuilder extends SlashCommandBuilder {
  /**
   * Adds all available localizations of name and description
   * @param {string} name name of command
   * @returns {this}
   */
  public setLocalizations(name: string): this {
    const localizations: any = getLocalizations(name);
    for (const entry in localizations) {
      const item: LocalizationTypes = localizations[entry];
      if (item.localized_name !== null) {
        this.setNameLocalization(item.localized_language, item.localized_name);
      }
      if (item.localized_description !== null) {
        this.setDescriptionLocalization(item.localized_language, item.localized_description);
      }
    }
    return this;
  }
}

export interface LocalizationTranslations {
  language: { LocalizationTypes: LocalizationTypes }
}

declare interface LocalizationTypes {
  localized_language: LocaleString
  localized_name: string
  localized_description: string
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
 * Extended {@link ChatInputCommandInteraction} to hold {@link DiscordUser}
 */
export interface DiscordChatInputCommandInteraction extends ChatInputCommandInteraction {
  user: DiscordUser
}

/**
 * Extended {@link ContextMenuCommandInteraction} to hold {@link DiscordUser}
 */
export interface DiscordContextMenuCommandInteraction extends ContextMenuCommandInteraction {
  user: DiscordUser
}

/**
 * Extended {@link MessageComponentInteraction} to hold {@link DiscordUser}
 */
export interface DiscordMessageComponentInteraction extends MessageComponentInteraction {
  user: DiscordUser
}

/**
 * Extended {@link MessageContextMenuCommandInteraction} to hold {@link DiscordUser}
 */
export interface DiscordMessageContextMenuCommandInteraction extends MessageContextMenuCommandInteraction {
  user: DiscordUser
}

/**
 * Extended {@link UserContextMenuCommandInteraction} to hold {@link DiscordUser}
 */
export interface DiscordUserContextMenuCommandInteraction extends UserContextMenuCommandInteraction {
  user: DiscordUser
}

/**
 * Extended {@link ModalSubmitInteraction} to hold {@link DiscordUser}
 */
export interface DiscordModalSubmitInteraction extends ModalSubmitInteraction {
  user: DiscordUser
}

/**
 * Extended {@link DiscordStringSelectMenuInteraction} to hold {@link DiscordUser}
 */
export interface DiscordStringSelectMenuInteraction extends StringSelectMenuInteraction {
  user: DiscordUser
}

/**
 * Extended {@link UserContextMenuCommandInteraction} to hold {@link DiscordUser}
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
  options: TOptions
}

interface InteractionCommands {
  name: string
  description: string
  usage: string
  Autocomplete?: any
  Button?: any
  Command?: any
  ContextMenu?: any
  MessageContextMenu?: any
  Modal?: any
  SelectMenu?: any
  UserContextMenu?: any
}

/**
 * Extended {@link ApplicationCommand} to hold {@link DiscordUser}
 */
export interface DiscordApplicationCommand extends ApplicationCommand {
  user: DiscordUser
}

interface config_settings_typing {
  prefix: string
  defaultLanguage: string
  presence: { [key: string]: { activities: { name: string; type: number }[]; status: PresenceStatusData | string } }
}

interface config_sensitive_typing {
  tenor?: {
    Key: string
    Filter: string
    Locale: string
    MediaFilter: string
    DateFormat: string
  }
  mensa?: {
    user: string
    password: string
    base_url: string
    api: string
    additional_info: string
  }
  calendars: { [key: string]: string }
  botToken: string
}

interface config_ids_typing {
  serverID: string
  channelIDs: {
    dev: {
      onlineCounter: string
      memberCounter: string
      botTestLobby: string
      admin: string
    }
    NUTZER_UPDATES: string
    ETITPersonalization: string
    MITPersonalization: string
    mensa: string
  }
  acceptedAdmins: {
    Christoph: string
    Leonard: string
  }
  userID: {
    botUserID: string
    etitChef: string
    leonard: string
    basti: string
    david: string
  }
  roleIDs: {
    adminRole: string
    Ophase: string
    'ETIT Bachelorstudent': string
    'MIT Bachelorstudent': string
  }
  einteilung: {
    ETITersti: string
    MITersti: string
  }
}
