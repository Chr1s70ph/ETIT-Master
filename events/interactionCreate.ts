import { DiscordClient } from '../types/customTypes'

exports.run = (client: DiscordClient, interaction: any) => {
  /**
   * Name of the interaction
   */
  const commandName = interaction.customId?.split('.')[0] ?? interaction.commandName

  /**
   * File to the corrospinging interaction.
   */
  const commandfile = client.interactions.get(commandName)

  /**
   * Set language for user
   */
  client.getLanguage(undefined, interaction)

  console.log(`${interaction.member.user.username} used ${commandName}`)
  if (interaction.isCommand()) {
    commandfile.Command(client, interaction)
  } else if (interaction.isSelectMenu()) {
    try {
      commandfile.SelectMenu(client, interaction)
    } catch (error) {
      console.log(error)
    }
  }
}
