import {
  Channel,
  GuildMember,
  EmbedBuilder,
  MessageMentions,
  NewsChannel,
  PartialDMChannel,
  TextChannel,
  ThreadChannel,
} from 'discord.js'
import { DiscordClient, DiscordMessage } from '../../types/customTypes'
exports.name = 'channelinfo'

exports.description = 'Displays some information about the channel and its users.'

exports.usage = 'channelinfo {#channel}'

exports.run = async (client: DiscordClient, message: DiscordMessage, args: string[]) => {
  /**
   * Channel to display information about.
   */
  const CHANNEL = await getChannel(args, client, message)

  /**
   * Check if channel has the needed attributes to execute command.
   */

  if ('members' in CHANNEL && 'size' in CHANNEL.members) {
    /**
     * Not forcing the fetch results in members missing.
     */
    await message.guild.members.fetch({ force: true })

    /**
     * List of users who can view {@link CHANNEL}.
     */
    const cutUserList = getUsers(CHANNEL)

    /**
     * Reply with collected information about {@link CHANNEL}.
     */
    return client.reply(message, {
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: client.user.tag, iconURL: client.user.avatarURL() })
          .setTitle(
            client.translate({
              key: 'commands.utility.channelinfo.Answer',
              options: {
                memberNumber: CHANNEL.members.size.toString(),
                channelName: CHANNEL.name,
                lng: message.author.language,
              },
            }),
          )
          .setColor('Blurple')
          .setDescription(cutUserList),
      ],
    })
  } else {
    /**
     * Tell user that {@link CHANNEL} does not meet the criteria to get information.
     */
    return client.reply(message, {
      embeds: [
        new EmbedBuilder().setDescription(
          client.translate({ key: 'commands.utility.channelinfo.ErrorNotAvailable', lng: message.author.language }),
        ),
      ],
    })
  }
}

/**
 * Helper function to get channel.
 * @param { string[] } args message arguments
 * @param { DiscordClient } client Bot client
 * @param { DiscordMessage } message issued command message
 * @returns { Channel | PartialDMChannel | TextChannel | NewsChannel | ThreadChannel }
 */
async function getChannel(
  args: string[],
  client: DiscordClient,
  message: DiscordMessage,
): Promise<Channel | PartialDMChannel | TextChannel | NewsChannel | ThreadChannel> {
  const _channel = args.find(value => MessageMentions.ChannelsPattern.test(value))?.slice(2, -1)
  const CHANNEL = _channel ? await client.channels.fetch(_channel) : message.channel
  return CHANNEL
}

/**
 * Retuns list of Users with maxLength of 4096 (max length of {@link EmbedBuilder.setDescription()}).
 * @param {TextChannel} channel Textchannel
 * @returns {string} List of users in that Channel
 */
function getUsers(channel): string {
  /**
   * Create list of all Members that can view {@link channel}
   */
  let users = ''
  channel.members.each((user: GuildMember) => (users += `· <@${user.id}> (${user.displayName})\n`))

  /**
   * Make sure the list is not too long for embeds and not cut off.
   */
  const cutIndex = users.slice(0, 4096).lastIndexOf('\n')
  const cutUserList = users.slice(0, cutIndex)

  /**
   * Return formatted list of users.
   */
  return cutUserList
}
