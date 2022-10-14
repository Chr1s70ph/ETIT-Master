import { readdir, statSync } from 'fs'
import { readdir as promiseReaddir } from 'fs/promises'
import { REST } from '@discordjs/rest'
import { TextChannel } from 'discord.js'
import { scheduleJob } from 'node-schedule'
import { mensa, getWeekday, _updateJson } from '../interactions/mensa'
import { DiscordClient } from '../types/customTypes'

const { Routes } = require('discord-api-types/v10')

/**
 * Folder that contains all slashCommands.
 */
const interactionsFolder = './interactions/'

exports.run = (client: DiscordClient) => {
  postInteractions(client)
  mensa_automation(client)
}

/**
 * Load and post all slashComamnds.
 * @param  {DiscordClient} client Bot-Client
 */
export async function postInteractions(client: DiscordClient) {
  /**
   * Object with all files of scripts directory.
   */
  let files

  const slashCommandData = []

  try {
    /**
     * Read directory.
     */
    files = await promiseReaddir(interactionsFolder)
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
    const slashCommand = require(`../${interactionsFolder}${file}`)

    slashCommandData.push(slashCommand.data.toJSON())

    const commandName = file.split('.')[0]

    client.interactions.set(commandName, slashCommand)
    console.log(`Successfully posted slashCommand ${commandName}`)
  })
  postSlashCommands(client, slashCommandData)
}

async function postSlashCommands(client, slashCommandData) {
  const rest = new REST({ version: '10' }).setToken(client.config.botToken)
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

    const message = channel.send({ embeds: [await mensa(client, weekday, 'adenauerring', null)] })
    ;(await message).crosspost()
  })
}
