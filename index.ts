import * as fs from 'fs'
import { Collection, Intents } from 'discord.js'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import config from './private/config.json'

import { DiscordClient } from './types/customTypes'

const backend = new Backend({
  loadPath: '/locales/{{lng}}/{{ns}}.json',
})

i18next.use(backend).init({
  lng: 'en-US',
  fallbackLng: 'en-US',
  preload: ['en-US', 'de'],
  load: 'currentOnly',
  ns: ['translation'],
  defaultNS: 'translation',
  debug: true,
  backend: {
    loadPath: './locales/{{lng}}.json',
  },
  initImmediate: false,
})

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
 * Set {@link DiscordClient} interactions to new {@link Collection}
 */
client.interactions = new Collection()

/**
 * Set config.
 */
client.config = config

/**
 * Login with botToken.
 */
client.login(client.config.botToken)

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
