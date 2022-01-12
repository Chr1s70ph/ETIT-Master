import { SlashCommandBuilder } from '@discordjs/builders'
import { DiscordClient, DiscordChatInputCommandInteraction } from '../types/customTypes'

const DEGREE_COURSE = 'studiengang'
const DEGREE_CHOICES: [string, string][] = [
  ['ETIT Bachelor', 'etit-bachelor'],
  ['ETIT Master', 'etit-master'],
  ['MIT Bachelor', 'mit-bachelor'],
  ['MIT Master', 'mit-master'],
  ['KIT Bachelor', 'kit-bachelor'],
  ['KIT Master', 'kit-master'],
]
const COURSES = 'fächer'
const FREETIME = 'freizeit'

export const data = new SlashCommandBuilder()
  .setName('rollenauswahl')
  .setDescription('Wähle deine Rollen')
  .addSubcommand(subcommand =>
    subcommand
      .setName(DEGREE_COURSE)
      .setDescription('Wähle deinen Studiengang')
      .addStringOption(option =>
        option
          .setDescription('Wähle deinen Studiengang')
          .setRequired(true)
          .setName(DEGREE_COURSE)
          .setChoices(DEGREE_CHOICES),
      ),
  )
  .addSubcommand(subcommand => subcommand.setName(COURSES).setDescription('Wähle deine Fächer'))
  .addSubcommand(subcommand => subcommand.setName(FREETIME).setDescription('Wähle deine Freizeit Rollen'))

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  const subCommand = interaction.options.getSubcommand()
  switch (subCommand) {
    case DEGREE_COURSE:
      degreeCourse()
      break
    case COURSES:
      courses()
      break
    case FREETIME:
      freetime()
      break

    default:
      break
  }
  console.log(interaction)
  await interaction.reply({ content: `${interaction.options.getSubcommand()}` })
}

function degreeCourse() {}

function courses() {}

function freetime() {}
