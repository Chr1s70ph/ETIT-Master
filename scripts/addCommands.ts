import { readdir as promiseReaddir } from 'fs/promises'
import { REST } from '@discordjs/rest'
import { Message, TextChannel } from 'discord.js'
import { scheduleJob } from 'node-schedule'
import { mensa, getWeekday, _updateJson } from '../interactions/global/mensa'
import { DiscordClient } from '../types/customTypes'

const { Routes } = require('discord-api-types/v10')

/**
 * Folder that contains all slashCommands.
 */
const PRIVATE_INTERACTIONS_FOLDER = './interactions/private/'
const GLOBAL_INTERACTIONS_FOLDER = './interactions/global/'

exports.run = async (client: DiscordClient) => {
  await postPrivateInteractions(client)
  await postGlobalInteractions(client)
  await mensa_automation(client)
}

/**
 * Load and post all slashComamnds.
 * @param  {DiscordClient} client Bot-Client
 */
export async function postPrivateInteractions(client: DiscordClient) {
  /**
   * Object with all files of scripts directory.
   */
  let files

  const slashCommandData = []

  try {
    /**
     * Read directory.
     */
    files = await promiseReaddir(PRIVATE_INTERACTIONS_FOLDER)
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
    const private_interaction = require(`../${PRIVATE_INTERACTIONS_FOLDER}/${file}`)

    slashCommandData.push(private_interaction.data.toJSON())

    const commandName = file.split('.')[0]

    client.interactions.set(commandName, private_interaction)
    console.log(`Successfully posted private interaction ${commandName}`)
  })
  postPrivateSlashCommands(client, slashCommandData)
}

async function postPrivateSlashCommands(client, slashCommandData) {
  const rest = new REST({ version: '10' }).setToken(client.config.botToken)
  try {
    console.log('Started refreshing private Interactions.')

    await rest.put(Routes.applicationGuildCommands(client.config.ids.userID.botUserID, '757981349402378331'), {
      body: slashCommandData,
    })

    console.log('Successfully reloaded private Interactions.')
  } catch (error) {
    console.error(error)
  }
}
/**
 * Load and post all slashComamnds.
 * @param  {DiscordClient} client Bot-Client
 */
export async function postGlobalInteractions(client: DiscordClient) {
  /**
   * Object with all files of scripts directory.
   */
  let files

  const slashCommandData = []

  try {
    /**
     * Read directory.
     */
    files = await promiseReaddir(GLOBAL_INTERACTIONS_FOLDER)
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
    const private_interaction = require(`../${GLOBAL_INTERACTIONS_FOLDER}/${file}`)

    slashCommandData.push(private_interaction.data.toJSON())

    const commandName = file.split('.')[0]

    client.interactions.set(commandName, private_interaction)
    console.log(`Successfully posted global interaction ${commandName}`)
  })
  postGlobalSlashCommands(client, slashCommandData)
}

async function postGlobalSlashCommands(client, slashCommandData) {
  const rest = new REST({ version: '10' }).setToken(client.config.botToken)
  try {
    console.log('Started refreshing global Interactions.')

    await rest.put(Routes.applicationCommands(client.config.ids.userID.botUserID), { body: slashCommandData })

    console.log('Successfully reloaded global Interactions.')
  } catch (error) {
    console.error(error)
  }
}

/**
 * Send Periodic Updates on whats new in the cafetaria.
 * @param {DiscordClient} client Bot-Client
 */
async function mensa_automation(client: DiscordClient) {
  await scheduleJob('0 5 * * 1-5', async () => {
    /**
     * Fetch latest updates of mensaplan
     */
    await _updateJson(client)

    const today = new Date()
    const weekday = today.getHours() >= 16 ? getWeekday(today.getDay()) : getWeekday(today.getDay() - 1)

    const channel = client.channels.cache.find(
      _channel => _channel.id === client.config.ids.channelIDs.mensa,
    ) as TextChannel

    const embed = await mensa(client, weekday, 'adenauerring', null)

    await channel.send({ embeds: [embed] }).then(async message => message.crosspost())
  })
}
