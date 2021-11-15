import { MessageEmbed, Message } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'

const gitlab = 'https://git.scc.kit.edu'
const github = 'https://git.io/J3Vao'

exports.name = 'git'

exports.description = 'Link zum KIT Gitlab und zur Repository'

exports.usage = 'git'

exports.run = (client: DiscordClient, message: Message) => {
  const git = new MessageEmbed()
    .setColor('#ffa500')
    .setAuthor(client.user.tag, 'https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png')
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

  return client.commandReplyPromise(message, { embeds: [git.setTimestamp()] })
}
