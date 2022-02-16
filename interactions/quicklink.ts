import { SlashCommandBuilder } from '@discordjs/builders'
import { MessageEmbed } from 'discord.js'
import { DiscordClient, DiscordCommandInteraction } from '../types/customTypes'

const links = {
  dontask: {
    link: 'https://dontasktoask.com/',
    title: "Don't ask to ask, just ask!",
    icon: 'https://dontasktoask.com/favicon.png',
  },
  exmatrikulation: {
    link: 'https://www.sle.kit.edu/imstudium/exmatrikulation.php',
    title: 'Wiederschauen und reingehauen!',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Logo_KIT.svg/800px-Logo_KIT.svg.png',
    color: 0x009682,
  },
  kw: {
    link: 'https://generationstrom.com/2020/01/07/kw-oder-kwh/',
    title: 'KW oder KWh?',
    icon: 'https://i1.wp.com/generationstrom.com/wp-content/uploads/2017/07/generationstrom_avatar_v2.png',
  },
  duden: {
    link: 'https://www.duden.de/',
    title: 'Aufschlagen, nachschlagen, zuschlagen. Duden.',
    icon: 'https://www.duden.de/modules/custom/duden_og_image/images/Duden_FB_Profilbild.jpg',
    color: 0xfbc53e,
  },
  stackoverflow: {
    link: 'https://stackoverflow.com/',
    title: 'Hippety hoppety your code is now my property!',
    // eslint-disable-next-line max-len
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Stack_Overflow_icon.svg/768px-Stack_Overflow_icon.svg.png',
    color: 0xef8236,
  },
  reddit: {
    link: 'https://www.reddit.com/r/KaIT/',
    title: 'r/KaIT',
    icon: 'https://www.redditinc.com/assets/images/site/reddit-logo.png',
    color: 0xff5700,
  },
}

export const data = new SlashCommandBuilder()
  .setName('quicklink')
  .setDescription('Links quick')
  .addStringOption(option =>
    option
      .setName('quicklinks')
      .setDescription('Choose your Quicklink')
      .addChoice('dontask', 'dontask')
      .addChoice('exmatrikulation', 'exmatrikulation')
      .addChoice('kw', 'kw')
      .addChoice('duden', 'duden')
      .addChoice('stackoverflow', 'stackoverflow')
      .addChoice('reddit', 'reddit')
      .setRequired(true),
  )
  .addUserOption(option => option.setName('userping').setDescription('Who do you want to annoy?'))

exports.Command = async (client: DiscordClient, interaction: DiscordCommandInteraction): Promise<void> => {
  const choice = interaction.options.getString('quicklinks')
  const ping = interaction.options.getUser('userping') ?? null
  await interaction.reply({
    content: ping ? `${ping}` : null,
    embeds: [
      new MessageEmbed()
        .setAuthor({ name: 'Quicklink' })
        .setThumbnail(links[choice].icon ?? null)
        .setTitle(links[choice].title)
        .setDescription(links[choice].link)
        .setColor(links[choice].color ?? null),
    ],
  })
}
