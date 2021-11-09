import * as fs from 'fs'
import { Collection, Intents } from 'discord.js'
import config from './private/config.json'

import { DiscordClient } from './types/customTypes'

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

client.commands = new Collection()
client.config = config

client.login(client.config.botToken)

fs.readdir('./commands/', (err, elements) => {
  const path = './commands/'
  if (err) return console.log(err)
  return elements.forEach(file => {
    // Loop through all elements in folder "commands"
    const element_in_folder = fs.statSync(`./commands/${file}`)
    if (element_in_folder.isDirectory() === true) {
      // Check if element in folder is a subfolder
      const sub_directory = `./commands/${file}/`
      fs.readdir(sub_directory, (_err, files) => {
        if (_err) return console.log(_err)
        return files.forEach(_file => {
          // Adds commands from subfolder to collection
          setCommands(sub_directory, _file, client)
        })
      })
      return
    }

    // Adds commands from parentfolder to collection
    setCommands(path, file, client)
  })
})

function setCommands(path: string, file: string, _client: DiscordClient) {
  if (!(file.endsWith('.js') || file.endsWith('.ts'))) return
  const props = require(`${path}${file}`)
  console.log(`Successfully loaded command ${file}`)
  const commandName = file.split('.')[0]
  _client.commands.set(commandName, props)
}

fs.readdir('./events/', (err, files) => {
  if (err) console.log(err)
  files.forEach(file => {
    const eventFunc = require(`./events/${file}`)
    console.log(`Successfully loaded event ${file}`)
    const eventName = file.split('.')[0]
    client.on(eventName, (...args) => eventFunc.run(client, ...args))
  })
})

export async function loadScripts(_client: DiscordClient) {
  let files
  try {
    files = await fs.promises.readdir('./scripts/')
  } catch (e) {
    console.log(e)
  }
  files.forEach(file => {
    const script = require(`./scripts/${file}`)
    try {
      script.run(_client)
    } catch (e) {
      console.log(e)
    }
    console.log(`Successfully executed startupScript ${file}`)
  })
}

export async function loadSlashCommands(_client: DiscordClient) {
  let files
  try {
    files = await fs.promises.readdir('./slashCommands/')
  } catch (e) {
    console.log(e)
  }
  files.forEach(file => {
    const slashCommand = require(`./slashCommands/${file}`)
    try {
      slashCommand.run(_client)
    } catch (e) {
      console.log(e)
    }
    console.log(`Successfully posted slashCommand ${file}`)
  })
}
