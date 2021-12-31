import { DiscordClient } from '../types/customTypes'

exports.run = async (client: DiscordClient) => {
  /**
   * Log that the bot is online and operational.
   */
  console.log('Online!')

  console.log(client.slashCommands)
}
