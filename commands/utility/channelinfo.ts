import {
  Channel,
  GuildMember,
  Message,
  MessageEmbed,
  MessageMentions,
  NewsChannel,
  PartialDMChannel,
  TextChannel,
  ThreadChannel,
} from 'discord.js'
import { DiscordClient } from '../../types/customTypes'
exports.name = 'channelinfo'

exports.description = 'Displays some information about the channel and its users.'

exports.usage = 'channelinfo {#channel}'

exports.run = async (client: DiscordClient, message: Message, args: string[]) => {
  const CHANNEL = await getChannel(args, client, message)
  if ('members' in CHANNEL && 'size' in CHANNEL.members) {
    // Check if channel has the needed attributes to execute command
    // Not forcing the fetch results in members missing
    await message.guild.members.fetch({ force: true })
    const cutUserList = getUsers(CHANNEL)
    return client.reply(message, {
      embeds: [
        new MessageEmbed()
          .setAuthor({ name: client.user.tag, iconURL: client.user.avatarURL() })
          .setTitle(`Anzahl an Kanalmitgliedern: ${CHANNEL.members.size.toString()}\nin ${CHANNEL.name}`)
          .setColor('BLURPLE')
          .setDescription(cutUserList),
      ],
    })
  } else {
    return client.reply(message, {
      embeds: [
        new MessageEmbed().setDescription('Nicht in diesem Kanal verfügbar. Probiere es doch in einem anderen Kanal.'),
      ],
    })
  }
}

/**
 * Helper function to get channel
 * @param { string[] } args message arguments
 * @param { DiscordClient } client Bot client
 * @param { Message } message issued command message
 * @returns { Channel | PartialDMChannel | TextChannel | NewsChannel | ThreadChannel }
 */
async function getChannel(
  args: string[],
  client: DiscordClient,
  message: Message<boolean>,
): Promise<Channel | PartialDMChannel | TextChannel | NewsChannel | ThreadChannel> {
  const _channel = args.find(value => MessageMentions.CHANNELS_PATTERN.test(value))?.slice(2, -1)
  const CHANNEL = _channel ? await client.channels.fetch(_channel) : message.channel
  return CHANNEL
}

/**
 * Retuns list of Users with maxLength of 4096 (max length of {@link MessageEmbed.setDescription()})
 * @param {TextChannel} channel Textchannel
 * @returns {string} List of users in that Channel
 */
function getUsers(channel): string {
  let users = ''
  channel.members.each((user: GuildMember) => (users += `· <@${user.id}> (${user.displayName})\n`))
  // Make sure the list is not too long for embeds and not cut off
  const cutIndex = users.slice(0, 4096).lastIndexOf('\n')
  const cutUserList = users.slice(0, cutIndex)
  return cutUserList
}
