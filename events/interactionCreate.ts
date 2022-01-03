import {
  DiscordAutocompleteInteraction,
  DiscordButtonInteraction,
  DiscordClient,
  DiscordCommandInteraction,
  DiscordMessageContextMenuInteraction,
  DiscordSelectMenuInteraction,
  DiscordUserContextMenuInteraction,
} from '../types/customTypes'

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

  if (interaction.isAutocomplete()) {
    const DiscordInteraction = interaction as DiscordAutocompleteInteraction
    commandfile.Autocomplete(client, DiscordInteraction)
  } else if (interaction.isButton()) {
    const DiscordInteraction = interaction as DiscordButtonInteraction
    commandfile.Button(client, DiscordInteraction)
  } else if (interaction.isCommand()) {
    const DiscordInteraction = interaction as DiscordCommandInteraction
    commandfile.Command(client, DiscordInteraction)
  } else if (interaction.isMessageContextMenu()) {
    const DiscordInteraction = interaction as DiscordMessageContextMenuInteraction
    commandfile.MessageContextMenu(client, DiscordInteraction)
  } else if (interaction.isSelectMenu()) {
    const DiscordInteraction = interaction as DiscordSelectMenuInteraction
    commandfile.SelectMenu(client, DiscordInteraction)
  } else if (interaction.isUserContextMenu()) {
    const DiscordInteraction = interaction as DiscordUserContextMenuInteraction
    commandfile.UserContextMenu(client, DiscordInteraction)
  }
}
