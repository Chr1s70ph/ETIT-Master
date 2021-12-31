import { Message, User, MessageEmbed } from 'discord.js'
import { GuildMember } from 'discord.js/typings/index.js'
import { DiscordClient } from '../../types/customTypes'

exports.name = 'userprofile'

exports.description = 'See when user joined the server, and since when user has nitro.'

exports.usage = 'userprofile {optional: @mentionedUser}'

exports.aliases = ['profile']

exports.run = async (client: DiscordClient, message: Message) => {
  /**
   * Set the user to fetch information about.
   */
  const user = (
    message.mentions.members.first() !== undefined ? message.mentions.members.first() : message.author
  ) as GuildMember

  /**
   * Fetch information about {@link user}.
   */
  const { forceFetchedUser, messageUser, userJoinedTimestamp, userPremiumSinceTimestamp } = await getUserInfo(
    message,
    user,
    client,
  )

  /**
   * Send reply with information about the user.
   */
  return client.reply(message, {
    embeds: [
      new MessageEmbed()
        .setAuthor({ name: '👤UserProfile' })
        .setTitle(forceFetchedUser.tag)
        .setColor(messageUser.displayColor)
        .setThumbnail(messageUser.displayAvatarURL({ dynamic: true }))
        .addField('Joined:', `<t:${userJoinedTimestamp}:D>`, true)
        .addField(
          'Nitro:',
          `${userPremiumSinceTimestamp ? `<t:${userPremiumSinceTimestamp}:D>` : 'Not currently subscribed'}`,
          true,
        )
        .setImage(forceFetchedUser.bannerURL({ size: 4096, dynamic: true }))
        .setFooter({ text: message.author.tag, iconURL: message.author.avatarURL({ dynamic: true }) }),
    ],
  })
}

/**
 *
 * @param {Message} message Message sent by the user
 * @param {GuildMember} user User to fetch information about
 * @param {DiscordClient} client Bot-Client
 * @returns {{User, GuildMember, string, string}}
 */
async function getUserInfo(
  message: Message<boolean>,
  user: GuildMember,
  client: DiscordClient,
): Promise<{
  forceFetchedUser: User
  messageUser: GuildMember
  userJoinedTimestamp: string
  userPremiumSinceTimestamp: string
}> {
  /**
   * Find user.
   */
  const messageUser = message.guild.members.cache.find(foundUser => foundUser.id === user.id) as GuildMember

  /**
   * Force fetch user to get banner url.
   */
  const forceFetchedUser = (await client.users.fetch(messageUser, { force: true })) as User

  /**
   * Fetch timestamp when user joined server.
   */
  const userJoinedTimestamp = messageUser.joinedTimestamp
    .toString()
    .substring(0, messageUser.joinedTimestamp.toString().length - 3)

  /**
   * Fetch timestamp since when user has nitro subsription.
   */
  const userPremiumSinceTimestamp = messageUser.premiumSinceTimestamp
    ?.toString()
    .substring(0, messageUser.premiumSinceTimestamp?.toString().length - 3)

  /**
   * Return information
   */
  return { forceFetchedUser, messageUser, userJoinedTimestamp, userPremiumSinceTimestamp }
}
