import * as fs from 'fs'
import { Collection, Intents } from 'discord.js'
import config from './private/config.json'

import { DiscordClient } from './types/customTypes'

/**
 * Folder that contains all commands.
 */
const commandsFolder = './commands/'

/**
 * Create instance of {@link DiscordClient}.
 */
const client: DiscordClient = new DiscordClient({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
})

/**
 * Set {@link DiscordClient} commands to new {@link Collection}
 */
client.commands = new Collection()

/**
 * Set config.
 */
client.config = config

/**
 * Login with botToken.
 */
client.login(client.config.botToken)

fs.readdir(commandsFolder, (err, elements) => {
  if (err) return console.log(err)
  return elements.forEach(file => {
    /**
     * Loop through all elements in folder "commands".
     */
    const element_in_folder = fs.statSync(`./commands/${file}`)
    if (element_in_folder.isDirectory() === true) {
      /**
       * Check if element in folder is a subfolder.
       */
      const sub_directory = `./commands/${file}/`
      fs.readdir(sub_directory, (_err, files) => {
        if (_err) return console.log(_err)
        return files.forEach(_file => {
          /**
           * Adds commands from subfolder to collection.
           */
          setCommands(sub_directory, _file, client)
        })
      })
      return
    }

    /**
     * Adds commands from parentfolder to collection.
     */
    setCommands(commandsFolder, file, client)
  })
})

/**
 * Add commands to {@link DiscordClient.commands}.
 * @param {string} path Path of commands folder
 * @param {string} file Files to check.
 * @param {DiscordClient} _client Bot-Client
 * @returns {void}
 */
function setCommands(path: string, file: string, _client: DiscordClient): void {
  if (!(file.endsWith('.js') || file.endsWith('.ts'))) return

  /**
   * Path of event file.
   */
  const props = require(`${path}${file}`)

  /**
   * Name of command.
   */
  const commandName = file.split('.')[0]

  /**
   * Add command to {@link DiscordClient.commands}.
   */
  _client.commands.set(commandName, props)

  console.log(`Successfully loaded command ${file}`)
}

/**
 * Load and run events.
 */
fs.readdir('./events/', (err, files) => {
  /**
   * Log errors.
   */
  if (err) console.log(err)

  /**
   * Loop through all event files.
   */
  files.forEach(file => {
    /**
     * Path of event file.
     */
    const eventFunc = require(`./events/${file}`)

    /**
     * Name of event.
     */
    const eventName = file.split('.')[0]

    console.log(`Successfully loaded event ${file}`)

    /**
     * Run events when triggered.
     */
    client.on(eventName, (...args) => eventFunc.run(client, ...args))
  })
})
/**
 * Load and run all scripts.
 * @param  {DiscordClient} _client Bot-Client
 */
export async function loadScripts(_client: DiscordClient) {
  /**
   * Object with all files of scripts directory.
   */
  let files

  try {
    /**
     * Read directory.
     */
    files = await fs.promises.readdir('./scripts/')
  } catch (e) {
    /**
     * Error handling.
     */
    throw new Error(e)
  }

  files.forEach(file => {
    /**
     * Path of script.
     */
    const script = require(`./scripts/${file}`)

    try {
      /**
       * Run scripts.
       */
      script.run(_client)
    } catch (e) {
      /**
       * Error handling.
       */
      throw new Error(e)
    }
    console.log(`Successfully executed startupScript ${file}`)
  })
}
/**
 * Load and post all slashComamnds.
 * @param  {DiscordClient} _client Bot-Client
 */
export async function loadSlashCommands(_client: DiscordClient) {
  /**
   * Object with all files of scripts directory.
   */
  let files

  try {
    /**
     * Read directory.
     */
    files = await fs.promises.readdir('./slashCommands/')
  } catch (e) {
    /**
     * Error handling.
     */
    throw new Error(e)
  }
  files.forEach(file => {
    /**
     * Path of slashCommand.
     */
    const slashCommand = require(`./slashCommands/${file}`)

    try {
      /**
       * Run scripts.
       */
      slashCommand.run(_client)
    } catch (e) {
      /**
       * Error handling.
       */
      throw new Error(e)
    }
    console.log(`Successfully posted slashCommand ${file}`)
  })
}
