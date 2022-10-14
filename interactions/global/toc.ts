import { PermissionsBitField, TextChannel, Snowflake, EmbedBuilder } from 'discord.js'
import { DiscordClient, DiscordChatInputCommandInteraction, DiscordSlashCommandBuilder } from '../../types/customTypes'
const MAX_EMBED_LENGTH = 4096

export const data = new DiscordSlashCommandBuilder()
  .setName('toc')
  .setDescription('Creates a table of contents')
  .setLocalizations('table_of_contents')
  .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
  .addChannelOption(option => option.setName('channel').setDescription('Channel to add ToC to.').setRequired(true))

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  /**
   * Send reply, that table of conents is being created
   */
  await interaction.reply({ content: 'your table of contents', ephemeral: true })

  /**
   * Channel ID of channel to create ToC of
   */
  const channel_id: Snowflake = interaction.options.getChannel('channel', true).id
  const channel: TextChannel = client.channels.cache.get(channel_id) as TextChannel

  /**
   * Array of embed descriptions
   * All descriptions meet the max length requirement
   */
  const descriptions: Array<string> = []

  /**
   * Fetch 100 messages (100 is the max the API allows)
   */
  await channel.messages.fetch({ limit: 100 }).then(messages => {
    /**
     * Reverse collection of messages
     * This resilts in the collection starting with the oldest message
     */
    messages.reverse()
    messages.forEach(message => {
      /**
       * Skip placeholder messages and messages that contain only embeds or attatchments
       */
      if (message.content.length <= 1) return

      /**
       * Check if message is a new subheading
       */
      if (message.content.indexOf('**') === 0) {
        descriptions[descriptions.length] = message.content
        return
      }

      /**
       * Extract title of message
       */
      const title = message.content.substring(message.content.indexOf('```') + 3, message.content.lastIndexOf('```'))

      /**
       * Build hyperlink for message to link to
       */
      // eslint-disable-next-line max-len
      const hyperlink = `\n- [${title}](https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id})`

      /**
       * Check if description exceeds {@link MAX_EMBED_LENGTH} and add a new entry to {@link descriptions} if needed
       */
      if ((descriptions[descriptions.length - 1] + hyperlink).length > MAX_EMBED_LENGTH) {
        descriptions[descriptions.length] = hyperlink
      } else {
        descriptions[descriptions.length - 1] += hyperlink
      }
    })
  })

  /**
   * Boolean to determine if embed is the forst of the ToC
   */
  let first_message = true

  /**
   * Loop over all descriptions
   */
  for (const description in descriptions) {
    /**
     * Skip descriptions that are empty (first entry is always empty)
     */
    if (descriptions[description].length < 1) break

    /**
     * Add description to embed
     */
    const embed = new EmbedBuilder().setDescription(descriptions[description])

    /**
     * Add title to first embed
     */
    if (first_message === true) {
      first_message = false
      embed.setTitle('Inhaltsverzeichnis')
    }

    /**
     * Send embeds
     */
    interaction.channel.send({ embeds: [embed] })
  }
}
