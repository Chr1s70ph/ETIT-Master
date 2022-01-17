import { SlashCommandBuilder } from '@discordjs/builders'
<<<<<<< HEAD
import { MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from 'discord.js'
import { DiscordClient, DiscordChatInputCommandInteraction, DiscordSelectMenuInteraction } from '../types/customTypes'
=======
import { DiscordClient, DiscordChatInputCommandInteraction } from '../types/customTypes'
>>>>>>> ccb94d5 (Add welcome Messages)

const DEGREE_COURSE = 'studiengang'
const DEGREE_CHOICES = [
  { label: 'ETIT-Bachelor', description: 'ETIT-bachelor', value: 'etit-bachelor' },
  { label: 'ETIT-Master', description: 'ETIT-Master', value: 'etit-master' },
  { label: 'MIT-Bachelor', description: 'MIT-bachelor', value: 'mit-bachelor' },
  { label: 'MIT-Master', description: 'MIT-Master', value: 'mit-master' },
  { label: 'KIT-Bachelor', description: 'KIT-Bachelor', value: 'kit-bachelor' },
  { label: 'KIT-Master', description: 'KIT-Master', value: 'kit-master' },
  { label: 'Gast', description: 'Gast', value: 'gast' },
]
const COURSES = 'fächer'
const FREETIME = 'freizeit'

export const data = new SlashCommandBuilder()
  .setName('rollenauswahl')
  .setDescription('Wähle deine Rollen')
  .addSubcommand(subcommand => subcommand.setName(DEGREE_COURSE).setDescription('Wähle deinen Studiengang'))
  .addSubcommand(subcommand => subcommand.setName(COURSES).setDescription('Wähle deine Fächer'))
  .addSubcommand(subcommand => subcommand.setName(FREETIME).setDescription('Wähle deine Freizeit Rollen'))

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  const subCommand = interaction.options.getSubcommand()
  switch (subCommand) {
    case DEGREE_COURSE:
      degreeCourse(client, interaction)
      break
    case COURSES:
      courses(client, interaction)
      break
    case FREETIME:
      freetime(client, interaction)
      break

    default:
      break
  }
  console.log(interaction)
}

function degreeCourse(client: DiscordClient, interaction: DiscordChatInputCommandInteraction) {
  const row = new MessageActionRow().addComponents(
    new MessageSelectMenu().setCustomId('rollenauswahl.degreeCourse').addOptions(DEGREE_CHOICES),
  )

  interaction.reply({ content: 'Studiengänge', components: [row] })
}

function courses(client: DiscordClient, interaction: DiscordChatInputCommandInteraction) {}

function freetime(client: DiscordClient, interaction: DiscordChatInputCommandInteraction) {}

exports.SelectMenu = async (client: DiscordClient, interaction: DiscordSelectMenuInteraction) => {
  interaction.reply({ content: 'nice' })
}
