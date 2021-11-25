import { Message, User, MessageEmbed } from 'discord.js'
import { GuildMember } from 'discord.js/typings/index.js'
import { DiscordClient } from '../../types/customTypes'

exports.name = 'userprofile'

exports.description = 'See when user joined the server, and since when user has nitro.'

exports.usage = 'userprofile {optional: @mentionedUser}'

exports.aliases = ['profile']

exports.run = async (client: DiscordClient, message: Message) => {
  const user = (
    message.mentions.members.first() !== undefined ? message.mentions.members.first() : message.author
  ) as GuildMember
  const { forceFetchedUser, messageUser, userJoinedTimestamp, userPremiumSinceTimestamp } = await getUserInfo(
    message,
    user,
    client,
  )

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
        .setFooter(message.author.tag, message.author.avatarURL({ dynamic: true })),
    ],
  })
}

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
  const messageUser = message.guild.members.cache.find(foundUser => foundUser.id === user.id) as GuildMember

  const forceFetchedUser = (await client.users.fetch(messageUser, { force: true })) as User

  const userJoinedTimestamp = messageUser.joinedTimestamp
    .toString()
    .substring(0, messageUser.joinedTimestamp.toString().length - 3)

  const userPremiumSinceTimestamp = messageUser.premiumSinceTimestamp
    ?.toString()
    .substring(0, messageUser.premiumSinceTimestamp?.toString().length - 3)
  return { forceFetchedUser, messageUser, userJoinedTimestamp, userPremiumSinceTimestamp }
}
