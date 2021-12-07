import { Message, MessageEmbed } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'
exports.name = 'onlinecount'

exports.description = 'Zeigt an, wie viele Leute online, idle und auf dnd sind.'

exports.usage = 'onlinecount'

exports.run = async (client: DiscordClient, message: Message) => {
  /**
   * Numbers of online, idle and dnd members.
   */
  const { online, idle, dnd } = await fetchMemberStates(client)

  /**
   * Embed with number of online, idle and dnd members
   */
  const onlineCountEmbed = createEmbed(client, online, idle, dnd)

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
 * @returns {MessageEmbed}
 */
function createEmbed(client: DiscordClient, online: number, idle: number, dnd: number): MessageEmbed {
  return new MessageEmbed()
    .setColor('#aaa540')
    .setTitle('[🌐] Online Counter')
    .setFooter(`[ID] ${client.config.ids.userID.botUserID}`, 'https://image.flaticon.com/icons/png/512/888/888879.png')
    .addFields(
      {
        name: '🟢Online:',
        value: `${online}`,
        inline: false,
      },
      {
        name: '🟡Idle:',
        value: `${idle}`,
        inline: false,
      },
      {
        name: '🔴DND:',
        value: `${dnd}`,
        inline: false,
      },
    )
}
