import { EmbedBuilder } from 'discord.js'
import { DiscordClient, DiscordMessage } from '../../types/customTypes'

const gitlab = 'https://git.scc.kit.edu'
const github = 'https://git.io/J3Vao'

exports.name = 'git'

exports.description = 'Link zum KIT Gitlab und zur Repository'

exports.usage = 'git'

exports.run = (client: DiscordClient, message: DiscordMessage) => {
  /**
   * Embed containing information about git.
   */
  const gitEmbed = createEmbed(client, message)

  return client.reply(message, { embeds: [gitEmbed.setTimestamp()] })
}

/**
 * Create a {@link EmbedBuilder} with git information.
 * URL of the embed leads to the git-documentation.
 * Seperate links to the repository of the bot and to the university gitlab.
 * @param {DiscordClient} client Bot-Client
 * @param {DiscordMessage} message Message sent by user
 * @returns {EmbedBuilder}
 */
function createEmbed(client: DiscordClient, message: DiscordMessage): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#ffa500')
    .setAuthor({ name: client.user.tag, iconURL: 'https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png' })
    .setThumbnail('https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png')
    .setTitle(client.translate({ key: 'commands.utility.git.Title', lng: message.author.language }))
    .setURL('https://git-scm.com/book/en/v2')
    .addFields(
      {
        name: 'Gitlab:',
        value: client.translate({
          key: 'commands.utility.git.Gitlab',
          options: { gitlab: gitlab, lng: message.author.language },
        }),
        inline: false,
      },
      {
        name: `Github:`,
        value: client.translate({
          key: 'commands.utility.git.Github',
          options: { github: github, userID: client.user.id, lng: message.author.language },
        }),
        inline: false,
      },
      {
        name: '\u200B',
        value: '\u200B',
      },
    )
    .setFooter({
      text: `[ID] ${client.user.id} \n`,
      iconURL: 'https://about.gitlab.com/images/press/logo/png/gitlab-icon-rgb.png',
    })
}
