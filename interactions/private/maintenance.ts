import { PermissionsBitField, PresenceData } from 'discord.js'
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
  .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  await interaction.deferReply()
  if (!Object.values(client.config.ids.acceptedAdmins).includes(interaction.user.id)) {
    await interaction.editReply({
      content: client.translate({ key: 'missingPermission', options: { lng: interaction.user.language } }),
    })
    return
  }

  client.maintenanceMode = interaction.options.getString('toggle', true) === 'true'

  if (interaction.options.getString('toggle', true) === 'true') {
    /**
     * Set customPresence on client
     */
    client.customPresence = {
      status: 'idle',
      activities: [{ name: 'Maintenance Mode', type: 0 }],
    }

    /**
     * Update client presence
     */
    client.user.setPresence(client.customPresence)
  } else {
    client.customPresence = null

    /**
     * Set Presence to first presence defined in the config
     */
    client.user.setPresence(<PresenceData>client.config.settings.presence[0])
  }

  await interaction.editReply('Toggled maintenance mode')
}
