import { fetchAndCacheCalendars } from '../../types/calendar_helper_functions'
import { DiscordClient, DiscordChatInputCommandInteraction, DiscordSlashCommandBuilder } from '../../types/customTypes'

export const data = new DiscordSlashCommandBuilder()
  .setName('refreshcalendars')
  .setDescription('Refreshes the cached calendars')
  .setLocalizations('refreshcalendars')

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  interaction.deferReply()
  if (!Object.values(client.config.ids.acceptedAdmins).includes(interaction.user.id)) {
    interaction.reply({
      content: client.translate({ key: 'missingPermission', options: { lng: interaction.user.language } }),
    })
  }

  await fetchAndCacheCalendars(client)

  interaction.editReply({
    content: client.translate({
      key: 'interactions.refreshcalendars.successfull',
      options: { lng: interaction.user.language },
    }),
  })
}
