import { SlashCommandBuilder } from '@discordjs/builders'
import { DiscordClient, DiscordCommandInteraction } from '../types/customTypes'

export const data = new SlashCommandBuilder()
  .setName('studiengang')
  .setDescription('Wähle deinen studiengang aus.')
  .addSubcommandGroup(option =>
    option
      .setName('subsection')
      .setDescription('Section description')
      .addSubcommand(suboption => suboption.setName('subcommand_shit').setDescription('sub sub section description'))
      .addSubcommand(suboption => suboption.setName('secondsubsection').setDescription('sum sum summ macht die biene')),
  )
  .addSubcommandGroup(option =>
    option
      .setName('subsection2')
      .setDescription('Even more subsections')
      .addSubcommand(suboption => suboption.setName('subsub_option').setDescription("'sup")),
  )

exports.Command = async (client: DiscordClient, interaction: DiscordCommandInteraction): Promise<void> => {
  await interaction.reply({ content: `${interaction.options.data[0].value}` })
}
