import { DiscordClient, DiscordChatInputCommandInteraction, DiscordSlashCommandBuilder } from '../../types/customTypes'

export const data = new DiscordSlashCommandBuilder()
  .setName('maintenance')
  .setDescription('Stecking the bot in the mainenance mode')
  .setLocalizations('maintenance')
  .addStringOption(option =>
    option
      .setName('toggle')
      .setDescription('Turn on or off')
      .setChoices({ name: 'true', value: 'true' }, { name: 'false', value: 'false' })
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

  client.maintenanceMode = interaction.options.getString('toogle') === 'true'

  await interaction.editReply('Toggled maintenance mode')
}
