import { EmbedBuilder, MessageFlags } from 'discord.js'
import { readFileSync } from 'fs'
import { DiscordChatInputCommandInteraction, DiscordClient, DiscordSlashCommandBuilder } from '../../types/customTypes'
const FACTS_FILE = './data/facts.txt'
const DATA = readFileSync(FACTS_FILE, 'utf-8').split('\n')

export const data = new DiscordSlashCommandBuilder()
  .setName('fact')
  .setDescription("Spi'ing facs")
  .setLocalizations('fact')

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  const fact = DATA[Math.floor(Math.random() * DATA.length)]
  const fact_embed = new EmbedBuilder()
    .setTitle(client.translate({ key: 'interactions.fact.fact', options: { lng: interaction.user.language } }))
    .setDescription(fact)
    .setFooter({
      text: interaction.user.tag,
      iconURL: interaction.user.avatarURL(),
    })

  await interaction.reply({ embeds: [fact_embed], flags: MessageFlags.Ephemeral })
}
