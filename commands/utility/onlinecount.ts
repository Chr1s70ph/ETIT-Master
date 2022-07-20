import { EmbedBuilder } from 'discord.js'
import { DiscordClient, DiscordMessage } from '../../types/customTypes'
exports.name = 'onlinecount'

exports.description = 'Zeigt an, wie viele Leute online, idle und auf dnd sind.'

exports.usage = 'onlinecount'

exports.run = async (client: DiscordClient, message: DiscordMessage) => {
  /**
   * Numbers of online, idle and dnd members.
   */
  const { online, idle, dnd } = await fetchMemberStates(client)

  /**
   * Embed with number of online, idle and dnd members
   */
  const onlineCountEmbed = createEmbed(client, online, idle, dnd, message)

  return client.reply(message, { embeds: [onlineCountEmbed.setTimestamp()] })
}

/**
 * Fetch number of online, idle and dnd members.
 * @param {DiscordClient} client Bot-Client
 * @returns {Promise}
 */
async function fetchMemberStates(client: DiscordClient): Promise<{ online: number; idle: number; dnd: number }> {
  /**
   * Fetch members of the server.
   */
  const GUILD_MEMBERS = await client.guilds.cache
    .get(client.config.ids.serverID)
    .members.fetch({ withPresences: true, force: true })

  /**
   * Count online, idle and dnd members.
   */
  const online = GUILD_MEMBERS.filter(_online => _online.presence?.status === 'online').size
  const idle = GUILD_MEMBERS.filter(_online => _online.presence?.status === 'idle').size
  const dnd = GUILD_MEMBERS.filter(_online => _online.presence?.status === 'dnd').size

  /**
   * Return values.
   */
  return { online, idle, dnd }
}

/**
 * Create Embed with number of online, idle and dnd members.
 * @param {DiscordClient} client Bot-Client
 * @param {number} online Number of online members
 * @param {number} idle Number of idle members
 * @param {number} dnd Number of dnd members
 * @param {DiscordMessage} message Message set by user
 * @returns {EmbedBuilder}
 */
function createEmbed(
  client: DiscordClient,
  online: number,
  idle: number,
  dnd: number,
  message: DiscordMessage,
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#aaa540')
    .setTitle(client.translate({ key: 'commands.utility.onlinecount.OnlineCounter', lng: message.author.language }))
    .setFooter({
      text: `[ID] ${client.config.ids.userID.botUserID}`,
      iconURL: 'https://image.flaticon.com/icons/png/512/888/888879.png',
    })
    .addFields(
      {
        name: client.translate({ key: 'commands.utility.onlinecount.Online', lng: message.author.language }),
        value: `${online}`,
        inline: false,
      },
      {
        name: client.translate({ key: 'commands.utility.onlinecount.Idle', lng: message.author.language }),
        value: `${idle}`,
        inline: false,
      },
      {
        name: client.translate({ key: 'commands.utility.onlinecount.DND', lng: message.author.language }),
        value: `${dnd}`,
        inline: false,
      },
    )
}
