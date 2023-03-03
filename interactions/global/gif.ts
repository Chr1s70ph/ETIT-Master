import { EmbedBuilder } from '@discordjs/builders'
import { DiscordClient, DiscordChatInputCommandInteraction, DiscordSlashCommandBuilder } from '../../types/customTypes'

export const data = new DiscordSlashCommandBuilder()
  .setName('gif')
  .setDescription("It's random gif time")
  .setLocalizations('gif')
  .addStringOption(option => option.setName('query').setDescription('query').setRequired(true))
  .addUserOption(option => option.setName('ping').setDescription('Nutzerping'))

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  await interaction.deferReply()

  const USER_QUERY = interaction.options.getString('query')
  const USER_PING = interaction.options.getUser('ping')?.toString() ?? null

  /**
   * Create instance of the tenorjs wrapper.
   */
  const Tenor = require('tenorjs').client(client.config.sensitive.tenor)

  /**
   * Query the Tenor-API for one random GIF.
   */
  Tenor.Search.Random(USER_QUERY, '1').then(async Results => {
    /**
     * New {@link EmbedBuilder} with random color.
     *
     * {@link EmbedBuilderFooter} is set to the user's tag and avatar who issued the command.
     */
    let embed = new EmbedBuilder().setColor(403090).setFooter({
      text: interaction.user.tag,
      iconURL: interaction.user.avatarURL(),
    })

    /**
     * Set image of embed if Tenor query returned any.
     * If no results have been returned, set Description to tell user that nothing has been found.
     */
    embed =
      Results.length === 0
        ? embed.setDescription(
            client.translate({
              key: 'interactions.gif.ErrorNoGifsFound',
              options: { userID: interaction.user.id, USER_QUERY: USER_QUERY, lng: interaction.user.language },
            }),
          )
        : embed.setImage(Results[0].media_formats.gif.url)

    await interaction.editReply({ content: USER_PING, embeds: [embed] })
  })
}
