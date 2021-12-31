import { DiscordClient, DiscordInteraction } from '../types/customTypes'

exports.run = (client: DiscordClient, interaction: any) => {
  /**
   * File to the corrospinging slashCommand.
   */
  const commandfile = client.slashCommands.get(interaction.commandName)

  /**
   * Set language for user
   */
  client.getLanguage(undefined, interaction)

  console.log(`${interaction.member.user.username} issued /${interaction.commandName}`)
  if (interaction.isCommand()) {
    commandfile.respond(client, interaction)
  } else if (interaction.isSelectMenu()) {
    try {
      /**
       * TODO commandfile is undefined
       */
      commandfile.selectMenuResponse(client, interaction)
    } catch (error) {
      console.log(error)
    }
  }
}
