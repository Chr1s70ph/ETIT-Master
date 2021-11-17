import { Message, MessageEmbed } from 'discord.js'
import fetch from 'node-fetch'
import { DiscordClient } from '../../types/customTypes'
/**
 * NOTE:
 * This code is heavily inspired by the discord-together package
 * I did not like how it was implemented, so I rewrote parts of it myself here
 * this is the original package: https://www.npmjs.com/package/discord-together
 */

const defaultApplications = {
  youtube: '880218394199220334',
  youtubedev: '880218832743055411',
  poker: '755827207812677713',
  betrayal: '773336526917861400',
  fishing: '814288819477020702',
  chess: '832012774040141894',
  chessdev: '832012586023256104',
  lettertile: '879863686565621790',
  wordsnack: '879863976006127627',
  doodlecrew: '878067389634314250',
  awkword: '879863881349087252',
  spellcast: '852509694341283871',
  checkers: '832013003968348200',
  puttparty: '763133495793942528',
  sketchyartist: '879864070101172255',
}
exports.name = 'start'

exports.description = `Trickst die API aus um Discord-Spiele freizuschalten. 
	**NOTIZ**: Nicht alle Spiele sind vollends implementiert`

exports.usage = `start \`${Object.keys(defaultApplications)}\``

exports.run = async (client: DiscordClient, message: Message, args: any, applications = defaultApplications) => {
  // Throw an error, when user not in voiceChannel
  if (!message.member.voice.channel) {
    return client.reply(message, {
      embeds: [
        new MessageEmbed().setDescription(
          `⚠️ You are not in a Voice-Channel.
						Please join a Voice-Channel to use this function`,
        ),
      ],
    })
  }

  client.applications = { ...defaultApplications, ...applications }
  const returnData = {
    code: 'none',
  }
  const option = args[0]
  const voiceChannelId = message.member.voice.channel.id
  if (option && client.applications[option.toLowerCase()]) {
    const applicationID = client.applications[option.toLowerCase()]
    try {
      // Send POST to the discordAPI to get an invite with a discord-together application
      await fetch(`https://discord.com/api/v9/channels/${voiceChannelId}/invites`, {
        method: 'POST',
        body: JSON.stringify({
          max_age: 86400,
          max_uses: 0,
          target_application_id: applicationID,
          target_type: 2,
          temporary: false,
          validate: null,
        }),
        headers: {
          Authorization: `Bot ${client.token}`,
          'Content-Type': 'application/json',
        },
      })
        .then(res => res.json())
        .then(invite => {
          // Error handling
          if (invite.error || !invite.code) throw new Error('An error occured while retrieving data !')
          if (invite.code === 50013 || invite.code === '50013') {
            throw new Error('Your bot lacks permissions to perform that action')
          }
          if (invite.code === 50035 || invite.code === '50035') throw new Error('Error creating the application')
          returnData.code = `https://discord.com/invite/${invite.code}`
        })
    } catch (err) {
      throw new Error(`An error occured while starting ${option} !${err}`)
    }
  } else {
    return client.reply(message, {
      embeds: [new MessageEmbed().setDescription(`⚠️ Invalid option!`)],
    })
  }

  return client.reply(message, {
    content: returnData.code,
    embeds: [
      new MessageEmbed().setDescription(
        `❔ If you can't join the activity **create it** by clicking the **[link](${returnData.code})** above.`,
      ),
    ],
  })
}
