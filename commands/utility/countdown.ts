import { MessageEmbed } from 'discord.js'
import { DiscordClient, DiscordMessage } from '../../types/customTypes'

exports.name = 'countdown'

exports.description = 'Ein simpler countdown von 10 runter'

exports.usage = 'countdown'

exports.run = async (client: DiscordClient, message: DiscordMessage) => {
  /**
   * Embed template.
   */
  const msgEmbed = new MessageEmbed()
    .setTitle(client.translate({ key: 'commands.utility.countdown.Countdown', lng: message.author.language }))
    .setFooter(message.author.tag, message.author.avatarURL({ dynamic: true }))
    .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/3/33/Cartoon_space_rocket.png')

  /**
   * Reply with the embed and set the description.
   */
  const msg = (await message
    .reply({
      embeds: [msgEmbed.setDescription(`🚀10🚀`)],
    })
    .then(_msg => {
      message.delete()
      return _msg
    })) as DiscordMessage

  /**
   * Update the embed to count down from 10.
   */
  editEmbed(msg, msgEmbed, client)
}

/**
 * Edit the embed to display a countdown.
 * @param {DiscordMessage} msg Message of the reply with the embed
 * @param {MessageEmbed} msgEmbed The embed to edit and attatch
 * @param {DiscordMessage} client Bot-Client
 * @returns {void}
 */
function editEmbed(msg: DiscordMessage, msgEmbed: MessageEmbed, client: DiscordClient): void {
  /**
   * Count only 8, 6, 4, 3, 2, 1, 0 and skips 9, 7, 5 due to API limits.
   */
  for (let i = 9; i >= 0; i--) {
    if (i > 3) {
      if (i % 2 === 0) {
        setTimeout(() => {
          msg.edit({ embeds: [msgEmbed.setDescription(`🚀${i}🚀`)] })
        }, 1000 * (10 - i))
      }
    } else {
      setTimeout(() => {
        if (i === 0) {
          msg.edit({
            embeds: [
              msgEmbed
                .setTitle(client.translate({ key: 'commands.utility.countdown.Departure', lng: msg.author.language }))
                .setDescription(
                  client.translate({ key: 'commands.utility.countdown.Liftoff', lng: msg.author.language }),
                ),
            ],
          })
        } else {
          msg.edit({ embeds: [msgEmbed.setDescription(`🚀${i}🚀`)] })
        }
      }, 1000 * (10 - i))
    }
  }
}
