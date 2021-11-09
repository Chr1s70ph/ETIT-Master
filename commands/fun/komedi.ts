import { MessageEmbed, Message } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'

exports.name = 'komedi'

exports.description = 'Das Komedi Meme'

exports.usage = 'komedi'

exports.run = async (client: DiscordClient, message: Message) => {
  await message.reply({
    embeds: [
      new MessageEmbed()
        .setImage('https://cdn.discordapp.com/attachments/768117219812835378/818145599894847488/eqmmb89gml941.png')
        .setFooter(message.author.tag, message.author.avatarURL({ dynamic: true })),
    ],
  })
}
