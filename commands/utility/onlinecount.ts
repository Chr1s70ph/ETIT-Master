import { Message, MessageEmbed } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'
exports.name = 'onlinecount'

exports.description = 'Zeigt an, wie viele Leute online, idle und auf dnd sind.'

exports.usage = 'onlinecount'

exports.run = async (client: DiscordClient, message: Message) => {
  const { online, idle, dnd } = await fetchMemberStates(client)

  const onlineCountEmbed = createEmbed(client, online, idle, dnd)

  return client.reply(message, { embeds: [onlineCountEmbed.setTimestamp()] })
}

async function fetchMemberStates(client: DiscordClient): Promise<{ online: number; idle: number; dnd: number }> {
  const GUILD_MEMBERS = await client.guilds.cache.get(client.config.ids.serverID).members.fetch({ withPresences: true })

  const online = GUILD_MEMBERS.filter(_online => _online.presence?.status === 'online').size

  const idle = GUILD_MEMBERS.filter(_online => _online.presence?.status === 'idle').size

  const dnd = GUILD_MEMBERS.filter(_online => _online.presence?.status === 'dnd').size
  return { online, idle, dnd }
}

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
