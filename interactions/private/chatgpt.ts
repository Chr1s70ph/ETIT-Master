import { ChannelType, TextChannel, ThreadChannel } from 'discord.js'
import { DiscordChatInputCommandInteraction, DiscordClient, DiscordSlashCommandBuilder } from '../../types/customTypes'

export const data = new DiscordSlashCommandBuilder()
  .setName('chatgpt')
  .setDescription('Talk with chatgpt')
  .setLocalizations('chatgpt')

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  const channel = interaction.channel

  if (channel.isThread()) {
    await interaction.reply({
      content: client.translate({
        key: 'interactions.chatgpt.already_in_thread',
        options: {
          lng: interaction.user.language,
        },
      }),
      ephemeral: true,
    })
    return
  }

  let thread: ThreadChannel
  if (channel instanceof TextChannel) {
    thread = await channel.threads.create({
      name: 'chat-gpt',
      autoArchiveDuration: 60,
      reason: 'Wanted to talk to chat-gpt',
      type: ChannelType.PrivateThread,
      rateLimitPerUser: 10,
    })
    thread.members.add(interaction.user.id)
    thread.setInvitable(false)

    thread.send(
      client.translate({
        key: 'interactions.chatgpt.thread_message',
        options: {
          lng: interaction.user.language,
        },
      }),
    )
  } else {
    await interaction.reply({
      content: client.translate({
        key: 'interactions.chatgpt.cannot_create_thread',
        options: {
          lng: interaction.user.language,
        },
      }),
      ephemeral: true,
    })
    return
  }

  await interaction.reply({
    content: client.translate({
      key: 'interactions.chatgpt.thread_created',
      options: {
        lng: interaction.user.language,
      },
    }),
    ephemeral: true,
  })
}
