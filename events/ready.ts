import { loadScripts, loadSlashCommands } from '../index'
import { DiscordClient } from '../types/customTypes'

exports.run = async (client: DiscordClient) => {
  await loadScripts(client)
  await loadSlashCommands(client)
  console.log('Online!')
}
