import { DiscordClient, DiscordChatInputCommandInteraction, DiscordSlashCommandBuilder } from '../../types/customTypes'

export const data = new DiscordSlashCommandBuilder()
  .setName('maintenance')
  .setDescription('Stecking the bot in the mainenance mode')
  .setLocalizations('maintenance')
  .addStringOption(option =>
    option
      .setName('toggle')
      .setDescription('Turn on or off')
      .setChoices({ name: 'on', value: 'true' }, { name: 'off', value: 'false' })
      .setRequired(true),
  )

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  await interaction.deferReply()
  if (!Object.values(client.config.ids.acceptedAdmins).includes(interaction.user.id)) {
    await interaction.editReply({
      content: client.translate({ key: 'missingPermission', options: { lng: interaction.user.language } }),
    })
    return
  }

  client.maintenanceMode = interaction.options.getString('toggle', true) === 'true'

  /**
   * Set customPresence on client
   */
  if (interaction.options.getString('toggle', true) === 'true') {
    client.customPresence = {
      status: 'idle',
      activities: [{ name: 'Maintenance Mode', type: 0 }],
    }
  } else {
    client.customPresence = null
  }

  /**
   * Update client presence
   */
  client.user.setPresence(client.customPresence)

  await interaction.editReply('Toggled maintenance mode')
}
