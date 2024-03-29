import { ApplicationCommandType, ComponentType, InteractionType } from 'discord.js'
import tx2 from 'tx2'
import {
  DiscordAutocompleteInteraction,
  DiscordButtonInteraction,
  DiscordClient,
  DiscordChatInputCommandInteraction,
  DiscordMessageContextMenuCommandInteraction,
  DiscordModalSubmitInteraction,
  DiscordStringSelectMenuInteraction,
  DiscordUserContextMenuCommandInteraction,
} from '../types/customTypes'

/**
 * Custom PM2 metric.
 */
const InteractionCounter = tx2.counter('Interactions issued')

exports.run = (client: DiscordClient, interaction: any) => {
  /**
   * Name of the interaction
   */
  const commandName = interaction.customId?.split('.')[0] ?? interaction.commandName

  /**
   * Check if maintenance mode is activated
   */
  if (
    client.maintenanceMode &&
    commandName !== 'maintenance' &&
    interaction.user.id === client.config.ids.acceptedAdmins.Christoph
  ) {
    console.log(`Ignoring  ${commandName} due to mainenance mode.`)
    return
  }

  /**
   * File to the corrospinging interaction.
   */
  const commandfile = client.interactions.get(commandName)

  if (commandfile === undefined) return

  /**
   * Set language for user
   */
  client.getLanguage(undefined, interaction)

  console.log(`${interaction.member.user.username} used ${commandName}`)

  /**
   * Increment the counter of issued interactions since last restart.
   */
  InteractionCounter.inc(1)

  if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
    const DiscordInteraction = interaction as DiscordAutocompleteInteraction
    commandfile.Autocomplete(client, DiscordInteraction)
  } else if (
    interaction.type === InteractionType.MessageComponent &&
    interaction.componentType === ComponentType.Button
  ) {
    const DiscordInteraction = interaction as DiscordButtonInteraction
    commandfile.Button(client, DiscordInteraction)
  } else if (interaction.type === InteractionType.ApplicationCommand) {
    const DiscordInteraction = interaction as DiscordChatInputCommandInteraction
    commandfile.Command(client, DiscordInteraction)
  } else if (interaction.isContextMenuCommand() && interaction.commandType === ApplicationCommandType.Message) {
    const DiscordInteraction = interaction as DiscordMessageContextMenuCommandInteraction
    commandfile.MessageContextMenu(client, DiscordInteraction)
  } else if (interaction.type === InteractionType.ModalSubmit) {
    const DiscordInteraction = interaction as DiscordModalSubmitInteraction
    commandfile.Modal(client, DiscordInteraction)
  } else if (
    interaction.type === InteractionType.MessageComponent &&
    interaction.componentType === ComponentType.SelectMenu
  ) {
    const DiscordInteraction = interaction as DiscordStringSelectMenuInteraction
    commandfile.SelectMenu(client, DiscordInteraction)
  } else if (interaction.isContextMenuCommand() && interaction.commandType === ApplicationCommandType.User) {
    const DiscordInteraction = interaction as DiscordUserContextMenuCommandInteraction
    commandfile.UserContextMenu(client, DiscordInteraction)
  }
}
