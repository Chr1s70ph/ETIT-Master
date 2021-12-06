import { loadScripts, loadSlashCommands } from '../index'
import { DiscordClient } from '../types/customTypes'

exports.run = async (client: DiscordClient) => {
  /**
   * Load all scripts.
   */
  await loadScripts(client)

  /**
   * Load all slashCommands.
   */
  await loadSlashCommands(client)

  /**
   * Log that the bot is online and operational.
   */
  console.log('Online!')
}
