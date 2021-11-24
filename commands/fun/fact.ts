import { readFileSync } from 'fs'
import { Message, MessageEmbed } from 'discord.js'
import { DiscordClient } from '../../types/customTypes'

const FACTS_FILE = './data/facts.txt'

exports.name = 'fact'

exports.description = 'Willst du Fakten? Dann bist du hier genau richtig.'

exports.usage = 'fact'

exports.run = (client: DiscordClient, message: Message) => {
  const DATA = readFileSync(FACTS_FILE, 'utf-8').split('\n')
  const fact = DATA[Math.floor(Math.random() * DATA.length)]
  return client.send(message, {
    embeds: [
      new MessageEmbed()
        .setTitle('🧠Fact')
        .setDescription(fact)
        .setFooter(message.author.tag, message.author.avatarURL({ dynamic: true })),
    ],
  })
}
