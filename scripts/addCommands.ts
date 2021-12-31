import { readdir, statSync } from 'fs'
import { readdir as promiseReaddir } from 'fs/promises'
import { REST } from '@discordjs/rest'
import { DiscordClient } from '../types/customTypes'
const { Routes } = require('discord-api-types/v9')

/**
 * Folder that contains all commands.
 */
const commandsFolder = './commands/'

/**
 * Folder that contains all slashCommands.
 */
const slashCommandsFolder = './slashCommands/'

exports.run = (client: DiscordClient) => {
  Commands(client)
  loadSlashCommands(client)
}

function Commands(client) {
  readdir(commandsFolder, (err, elements) => {
    if (err) return console.log(err)
    return elements.forEach(file => {
      /**
       * Loop through all elements in folder "commands".
       */
      const element_in_folder = statSync(`./commands/${file}`)
      if (element_in_folder.isDirectory() === true) {
        /**
         * Check if element in folder is a subfolder.
         */
        const sub_directory = `./commands/${file}/`
        readdir(sub_directory, (_err, files) => {
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
}

/**
 * Add commands to {@link DiscordClient.commands}.
 * @param {string} path Path of commands folder
 * @param {string} file Files to check.
 * @param {DiscordClient} client Bot-Client
 * @returns {void}
 */
function setCommands(path: string, file: string, client: DiscordClient): void {
  if (!(file.endsWith('.js') || file.endsWith('.ts'))) return

  /**
   * Path of command file.
   */
  const props = require(`../${path}${file}`)

  /**
   * Name of command.
   */
  const commandName = file.split('.')[0]

  /**
   * Add command to {@link DiscordClient.commands}.
   */
  client.commands.set(commandName, props)

  console.log(`Successfully loaded command ${file}`)
}

/**
 * Load and post all slashComamnds.
 * @param  {DiscordClient} client Bot-Client
 */
export async function loadSlashCommands(client: DiscordClient) {
  /**
   * Object with all files of scripts directory.
   */
  let files

  const slashCommandData = []

  try {
    /**
     * Read directory.
     */
    files = await promiseReaddir(slashCommandsFolder)
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
    const slashCommand = require(`../${slashCommandsFolder}${file}`)

    slashCommandData.push(slashCommand.data.toJSON())

    const commandName = file.split('.')[0]

    client.slashCommands.set(commandName, slashCommand)
    console.log(`Successfully posted slashCommand ${file}`)
  })
  postSlashCommands(client, slashCommandData)
}

async function postSlashCommands(client, slashCommandData) {
  const rest = new REST({ version: '9' }).setToken(client.config.botToken)
  try {
    console.log('Started refreshing application (/) commands.')

    await rest.put(Routes.applicationGuildCommands(client.config.ids.userID.botUserID, '757981349402378331'), {
      body: slashCommandData,
    })

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
}
