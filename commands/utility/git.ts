import { MessageEmbed, Message } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'

const gitlab = 'https://git.scc.kit.edu'
const github = 'https://git.io/J3Vao'

exports.name = 'git'

exports.description = 'Link zum KIT Gitlab und zur Repository'

exports.usage = 'git'

exports.run = (client: DiscordClient, message: Message) => {
  /**
   * Embed containing information about git.
   */
  const gitEmbed = createEmbed(client)

  return client.reply(message, { embeds: [gitEmbed.setTimestamp()] })
}

/**
 * Create a {@link MessageEmbed} with git information.
 * URL of the embed leads to the git-documentation.
 * Seperate links to the repository of the bot and to the university gitlab.
 * @param {DiscordClient} client Bot-Client
 * @returns {MessageEmbed}
 */
function createEmbed(client: DiscordClient): MessageEmbed {
  return new MessageEmbed()
    .setColor('#ffa500')
    .setAuthor({ name: client.user.tag, iconURL: 'https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png' })
    .setThumbnail('https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png')
    .setTitle('[🌐] GIT Wiki')
    .setURL('https://git-scm.com/book/en/v2')
    .addFields(
      {
        name: 'Gitlab:',
        value: `[Link](${gitlab}) zur Gitlab Startseite`,
        inline: false,
      },
      {
        name: `Github:`,
        value: `Github [Repository](${github}) von <@${client.config.ids.userID.botUserID}>`,
        inline: false,
      },
      {
        name: '\u200B',
        value: '\u200B',
      },
    )
    .setFooter(
      `[ID] ${client.config.ids.userID.botUserID} \n`,
      'https://about.gitlab.com/images/press/logo/png/gitlab-icon-rgb.png',
    )
}
