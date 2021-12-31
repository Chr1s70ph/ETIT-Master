import { DiscordClient, DiscordInteraction } from '../types/customTypes'

exports.run = (client: DiscordClient, interaction: DiscordInteraction) => {
  if (interaction.isCommand()) {
    /**
     * File to the corrospinging slashCommand.
     */
    const commandfile = client.slashCommands.get(interaction.commandName)

    /**
     * Set language for user
     */
    client.getLanguage(undefined, interaction)

    console.log(`${interaction.member.user.username} issued /${interaction.commandName}`)

    commandfile.respond(client, interaction)
  }
}
