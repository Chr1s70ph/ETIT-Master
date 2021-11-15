import { Message, MessageEmbed } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'
exports.name = 'onlinecount'

exports.description = 'Zeigt an, wie viele Leute online, idle und auf dnd sind.'

exports.usage = 'onlinecount'

exports.run = async (client: DiscordClient, message: Message) => {
  const onlineCountEmbed = new MessageEmbed()
    .setColor('#aaa540')
    .setTitle('[🌐] Online Counter')
    .setFooter(`[ID] ${client.config.ids.userID.botUserID}`, 'https://image.flaticon.com/icons/png/512/888/888879.png')

  const GUILD_MEMBERS = await client.guilds.cache.get(client.config.ids.serverID).members.fetch({ withPresences: true })

  const online = GUILD_MEMBERS.filter(_online => _online.presence?.status === 'online').size

  const idle = GUILD_MEMBERS.filter(_online => _online.presence?.status === 'idle').size

  const dnd = GUILD_MEMBERS.filter(_online => _online.presence?.status === 'dnd').size

  onlineCountEmbed.addFields(
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

  return client.reply(message, { embeds: [onlineCountEmbed.setTimestamp()] })
}
