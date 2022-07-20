import { User, EmbedBuilder } from 'discord.js'
import { GuildMember } from 'discord.js/typings/index.js'
import { DiscordClient, DiscordMessage } from '../../types/customTypes'

exports.name = 'userprofile'

exports.description = 'See when user joined the server, and since when user has nitro.'

exports.usage = 'userprofile {optional: @mentionedUser}'

exports.aliases = ['profile']

exports.run = async (client: DiscordClient, message: DiscordMessage) => {
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
      new EmbedBuilder()
        .setAuthor({
          name: client.translate({ key: 'commands.utility.userprofile.UserProfile', lng: message.author.language }),
        })
        .setTitle(forceFetchedUser.tag)
        .setColor(messageUser.displayColor)
        .setThumbnail(messageUser.displayAvatarURL({ size: 4096 }))
        .addFields([
          {
            name: client.translate({ key: 'commands.utility.userprofile.Joined', lng: message.author.language }),
            value: `<t:${userJoinedTimestamp}:D>`,
            inline: true,
          },
        ])
        .addFields([
          {
            name: 'Nitro:',
            value: `${
              userPremiumSinceTimestamp
                ? `<t:${userPremiumSinceTimestamp}:D>`
                : client.translate({ key: 'commands.utility.userprofile.NoNitroStatus', lng: message.author.language })
            }`,
            inline: true,
          },
        ])
        .setImage(forceFetchedUser.bannerURL({ size: 4096 }))
        .setFooter({ text: message.author.tag, iconURL: message.author.avatarURL() }),
    ],
  })
}

/**
 *
 * @param {DiscordMessage} message Message sent by the user
 * @param {GuildMember} user User to fetch information about
 * @param {DiscordClient} client Bot-Client
 * @returns {{User, GuildMember, string, string}}
 */
async function getUserInfo(
  message: DiscordMessage,
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
