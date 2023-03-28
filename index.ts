import * as fs from 'fs'
import { Collection, GatewayIntentBits, Partials } from 'discord.js'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import ids from './private/ids.json'
import sensitive from './private/sensitive.json'
import settings from './private/settings.json'

import { DiscordClient } from './types/customTypes'

const backend = new Backend({
  loadPath: 'locales/{{lng}}/{{ns}}.json',
})

i18next.use(backend).init({
  lng: 'en-US',
  fallbackLng: ['en-US', 'de'],
  preload: ['en-US', 'de'],
  load: 'currentOnly',
  ns: ['translation'],
  defaultNS: 'translation',
  debug: true,
  backend: {
    loadPath: 'locales/{{lng}}.json',
  },
  initImmediate: false,
})

/**
 * Create instance of {@link DiscordClient}.
 */
const client: DiscordClient = new DiscordClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
})

/**
 * Set {@link DiscordClient} interactions to new {@link Collection}
 */
client.interactions = new Collection()

/**
 * Set config.
 */
client.config = {
  settings: settings,
  sensitive: sensitive,
  ids: ids,
}

/**
 * Login with botToken.
 */
client.login(client.config.sensitive.botToken)

/**
 * Load and run events.
 */
fs.readdir('./events/', (err, files) => {
  /**
   * Log errors.
   */
  if (err) return console.log(err)

  /**
   * Loop through all event files.
   */
  return files.forEach(file => {
    /**
     * Path of event file.
     */
    const eventFunc = require(`./events/${file}`)

    /**
     * Name of event.
     */
    const eventName = file.split('.')[0]

    console.log(`Successfully loaded event ${eventName}`)

    /**
     * Run events when triggered.
     */
    client.on(eventName, (...args) => eventFunc.run(client, ...args))
  })
})
