import { Message, MessageEmbed } from 'discord.js'
import fetch from 'node-fetch'
import { DiscordClient } from '../../types/customTypes'
/**
 * NOTE:
 * This code is heavily inspired by the discord-together package
 * I did not like how it was implemented, so I rewrote parts of it myself here
 * this is the original package: https://www.npmjs.com/package/discord-together
 */

/**
 * IDs of discord applications.
 */
const defaultApplications = {
  awkword: '879863881349087252',
  betrayal: '773336526917861400',
  checkers: '832013003968348200',
  chess: '832012774040141894',
  chessdev: '832012586023256104',
  doodlecrew: '878067389634314250',
  fishing: '814288819477020702',
  lettertile: '879863686565621790',
  poker: '755827207812677713',
  puttparty: '763133495793942528',
  sketchyartist: '879864070101172255',
  spellcast: '852509694341283871',
  wordsnack: '879863976006127627',
  youtube: '880218394199220334',
  youtubedev: '880218832743055411',
}
exports.name = 'start'

exports.description = `Trickst die API aus um Discord-Spiele freizuschalten. 
	**NOTIZ**: Nicht alle Spiele sind vollends implementiert`

exports.usage = `start \`${Object.keys(defaultApplications)}\``

exports.run = async (client: DiscordClient, message: Message, args: any, applications = defaultApplications) => {
  /**
   * Throw an error, if the user is not in a voiceChannel.
   */
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

  /**
   * Add applications to {@link DiscordClient}
   */
  client.applications = { ...defaultApplications, ...applications }

  /**
   * Data to send back.
   */
  const returnData = {
    code: 'none',
  }

  /**
   * Discord application selected by the user.
   */
  const option = args[0]

  /**
   * VoicechannelID of the user who issued the command.
   */
  const voiceChannelId = message.member.voice.channel.id

  /**
   * Check if the application selcted by the user exists.
   */
  if (option && client.applications[option.toLowerCase()]) {
    /**
     * If selected application exists, create an invite with an invite code to the application.
     */
    await createInvite(client, option, voiceChannelId, returnData)
  } else {
    /**
     * Send reply telling the user, that the application they selected does not exist.
     */
    return client.reply(message, {
      embeds: [new MessageEmbed().setDescription(`⚠️ Invalid option!`)],
    })
  }

  /**
   * Send a message with the invite code.
   */
  return client.reply(message, {
    content: returnData.code,
    embeds: [
      new MessageEmbed().setDescription(
        `❔ If you can't join the activity **create it** by clicking the **[link](${returnData.code})** above.`,
      ),
    ],
  })
}

/**
 * Query the API and fetch a invite code with the selected application.
 * @param {DiscordClient} client Bot-Client
 * @param {any} option Application selected by the user
 * @param {string} voiceChannelId ID of the voice channel the user is inside
 * @param {{code: string}} returnData Data to send back
 */
async function createInvite(
  client: DiscordClient,
  option: any,
  voiceChannelId: string,
  returnData: { code: string },
): Promise<void> {
  const applicationID = client.applications[option.toLowerCase()]
  try {
    /**
     * Send POST to the discordAPI to get an invite with a discord-together application.
     */
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
        /**
         * Handle errors.
         */
        handleInviteErrors(invite, returnData)
      })
  } catch (err) {
    throw new Error(`An error occured while starting ${option} !${err}`)
  }
}

/**
 * Handle errors that occur when creating the invite.
 * @param {any} invite Discord invite
 * @param {{code: string}} returnData Data to send back
 */
function handleInviteErrors(invite: any, returnData: { code: string }): void {
  if (invite.error || !invite.code) throw new Error('An error occured while retrieving data !')
  if (invite.code === 50013 || invite.code === '50013') {
    throw new Error('Your bot lacks permissions to perform that action')
  }
  if (invite.code === 50035 || invite.code === '50035') throw new Error('Error creating the application')
  returnData.code = `https://discord.com/invite/${invite.code}`
}
