import { readdir } from 'fs/promises'
import { DiscordClient } from '../types/customTypes'

exports.run = async (client: DiscordClient) => {
  await loadScripts(client)
  /**
   * Log that the bot is online and operational.
   */
  console.log('Online!')
}

/**
 * Load and run all scripts.
 * @param  {DiscordClient} client Bot-Client
 */
async function loadScripts(client) {
  /**
   * Read directory.
   */
  const files = await readdir('./scripts/')

  files.forEach(file => {
    /**
     * Path of script.
     */
    const script = require(`../scripts/${file}`)

    try {
      /**
       * Run scripts.
       */
      script.run(client)
    } catch (e) {
      /**
       * Error handling.
       */
      throw new Error(e)
    }
    console.log(`Successfully started script ${file}`)
  })
}
