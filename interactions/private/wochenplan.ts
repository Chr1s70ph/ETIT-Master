import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js'
import moment from 'moment-timezone'
import { extractZoomLinks, filterEvents } from '../../types/calendar_helper_functions'
import {
  DiscordClient,
  DiscordChatInputCommandInteraction,
  DiscordSlashCommandBuilder,
  DiscordButtonInteraction,
} from '../../types/customTypes'

exports.name = 'wochenplan'

exports.description = '️Zeigt den Wochenplan an.'

exports.usage = `wochenplan {TAG}`

let startOfWeek = new Date()

export const data = new DiscordSlashCommandBuilder()
  .setName('wochenplan')
  .setDescription('Zeigt deinen Wochenplan an.')
  .addStringOption(option =>
    option.setName('datum').setDescription('Das Datum, das angezeigt werden soll. Format: DD.MM.YYYY'),
  )
  .setLocalizations('wochenplan')

function wochenplan(
  client: DiscordClient,
  interaction: DiscordChatInputCommandInteraction | DiscordButtonInteraction,
  date,
) {
  let calendars_object = {}
  const calendars = client.calendars.values()
  for (const entry of calendars) {
    calendars_object = { ...calendars_object, ...entry }
  }

  const relevantEvents = []
  const curWeekday = date.getDay() === 0 ? 6 : date.getDay() - 1
  startOfWeek = new Date(date.setDate(date.getDate() - curWeekday))
  startOfWeek.setHours(0, 0, 0)

  const rangeStart = moment(startOfWeek)
  const rangeEnd = rangeStart.clone().add(7, 'days')

  filterEvents(calendars_object, rangeStart, rangeEnd, interaction, relevantEvents, false)

  const embed = new EmbedBuilder()
    .setAuthor({
      name: client.translate({
        key: 'interactions.wochenplan.Schedule',
        options: {
          user: interaction.user.username,
          lng: interaction.user.language,
        },
      }),
    })
    .setDescription(
      client.translate({
        key: 'interactions.wochenplan.week',
        options: { date: moment(startOfWeek).format('DD.MM.yyyy'), lng: interaction.user.language },
      }),
    )

  const weekdayItems = {}

  for (const relevantEvent of relevantEvents) {
    if (typeof relevantEvent.start.tz === 'undefined') {
      const tzOffset = moment().tz('Europe/Berlin').utcOffset()
      relevantEvent.start.setMinutes(relevantEvent.start.getMinutes() + tzOffset)
      relevantEvent.end.setMinutes(relevantEvent.end.getMinutes() + tzOffset)
    }

    if (!weekdayItems[moment(relevantEvent.start).days()]) {
      weekdayItems[moment(relevantEvent.start).days()] = []
    }
    weekdayItems[moment(relevantEvent.start).days()].push(relevantEvent)
  }

  moment.locale(interaction.user.language)
  let embed_too_long = false

  for (const weekdayKey of Object.keys(weekdayItems)) {
    let weekdayItem = weekdayItems[weekdayKey]
    weekdayItem = weekdayItem.sort((a, b) => moment(a.start).hours() - moment(b.start).hours())

    const courseDate = moment(
      new Date(
        `${startOfWeek.getFullYear()}-${(startOfWeek.getMonth() + 1).toString().padStart(2, '0')}-${(
          startOfWeek.getDate() +
          parseInt(weekdayKey) -
          1
        )
          .toString()
          .padStart(2, '0')}T00:00:00`,
      ),
    ).format('DD.MM.yyyy (dddd)')
    let body = ''

    for (const weekdayEvent of weekdayItem) {
      /**
       * Add Time and name of Course
       */
      body += `\`${moment(weekdayEvent.start).format('HH:mm')} - ${moment(weekdayEvent.end).format('HH:mm')}\` ${
        weekdayEvent.summary
      } `

      /**
       * Add Google Maps link if available
       */
      if (weekdayEvent.location) {
        /**
         * Regex replaceAll needed, otherwise on mobile hyperlinks would have half the link bare and not hyperlinked
         */
        body += `__[Maps](https://www.google.com/maps/search/KIT+${encodeURIComponent(
          weekdayEvent.location.replaceAll(/\(.*?\)/g, ''),
        )})__`
      }

      if (
        weekdayEvent.desccription !== undefined &&
        weekdayEvent.description.indexOf('https://kit-lecture.zoom.us') !== -1
      ) {
        /**
         * Add zoom hyperlink if available
         */
        body += `, __[Zoom](${extractZoomLinks(weekdayEvent.description)})__`
      }

      body += '\n'
    }

    const MAX_EMBED_VALUE_LENGTH = 1024
    if (body.length > MAX_EMBED_VALUE_LENGTH) {
      body = `${body.substring(0, MAX_EMBED_VALUE_LENGTH - 3)}...`
      embed_too_long = true
    }
    embed.addFields({ name: courseDate, value: body, inline: false })
  }

  if (embed_too_long) {
    embed.addFields({
      name: `${client.translate({
        key: 'interactions.wochenplan.too_long.name',
        options: { lng: interaction.user.language },
      })}`,
      value: `${client.translate({
        key: 'interactions.wochenplan.too_long.value',
        options: { lng: interaction.user.language },
      })}`,
      inline: false,
    })
  }

  return embed
}

exports.Command = async (client: DiscordClient, interaction: DiscordChatInputCommandInteraction): Promise<void> => {
  /**
   * Defer interaction reply, since it can take some time to come through all calendars
   */
  await interaction.deferReply({ ephemeral: true })

  /**
   * Get options from interaction
   */
  const options: string = interaction.options.get('datum')?.value as string
  const option: string[] = options?.split('.')

  /**
   * Cast options to date
   */
  const option_date = option ? new Date(`${option[2]}-${option[1]}-${option[0]}T00:00:00`) : new Date()
  const valid_date = option_date.toString() !== 'Invalid Date'
  const date = JSON.stringify(option_date) === 'null' ? new Date() : option_date

  /**
   * Create embed for current week
   */
  const embed = await wochenplan(client, interaction, date)

  /**
   * Create buttons for current week
   */
  const buttonRow = createWeekButtons(startOfWeek, client, interaction)

  /**
   * Tell user, that the entered date is invalid
   */
  if (!valid_date) {
    embed.addFields({
      name: `${client.translate({
        key: 'interactions.wochenplan.invalid_Date.name',
        options: { lng: interaction.user.language },
      })}`,
      value: `${client.translate({
        key: 'interactions.wochenplan.invalid_Date.value',
        options: { lng: interaction.user.language },
      })}`,
      inline: false,
    })
  }

  /**
   * Send current weeks schedule
   */
  await interaction.editReply({
    embeds: [embed],
    components: [buttonRow],
  })
}

exports.Button = async (client: DiscordClient, interaction: DiscordButtonInteraction): Promise<void> => {
  /**
   * Get current week from customID of the button triggered
   */
  const curWeek = interaction.customId.split('.')[2]

  /**
   * Create new embed
   */
  const embed = await wochenplan(client, interaction, new Date(curWeek))

  /**
   * Create new buttons
   */
  const buttons = createWeekButtons(new Date(curWeek), client, interaction)

  /**
   * Update the interaction with the new embed and buttons
   */
  interaction.update({ embeds: [embed], components: [buttons] })
}

/**
 * Helper function to create a ActionRow containing buttons for previous/next week
 * @param {Date} weekStartDay week start of which to get prev/next week buttons for
 * @param {DiscordClient} client Bot-Client
 * @param {DiscordChatInputCommandInteraction | DiscordButtonInteraction} interaction interaction to reply to
 * @returns {ActionRowBuilder<ButtonBuilder>} Actionrow
 */
function createWeekButtons(
  weekStartDay: Date,
  client: DiscordClient,
  interaction: DiscordChatInputCommandInteraction | DiscordButtonInteraction,
): ActionRowBuilder<ButtonBuilder> {
  /**
   * Calculate previous and next week
   */
  const prevWeek = moment(new Date(weekStartDay.getTime() - 7 * 24 * 60 * 60 * 1000))
  const nextWeek = moment(new Date(weekStartDay.getTime() + 7 * 24 * 60 * 60 * 1000))

  /**
   * Action row to return
   */
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    /**
     * Button for previous week
     */
    new ButtonBuilder()
      .setCustomId(`wochenplan.prev_week.${prevWeek.format('YYYY-MM-DD')}`)
      .setLabel(
        `${client.translate({
          key: 'interactions.wochenplan.prev_week',
          options: {
            interpolation: { escapeValue: false },
            week_start_date: prevWeek.format('DD.MM'),
            lng: interaction.locale,
          },
        })}`,
      )
      .setStyle(ButtonStyle.Primary),

    /**
     * Blank button for seperation
     */
    new ButtonBuilder()
      .setCustomId('wochenplan.blank')
      .setLabel('   ')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),

    /**
     * Button for next week
     */
    new ButtonBuilder()
      .setCustomId(`wochenplan.mext_week.${nextWeek.format('YYYY-MM-DD')}`)
      .setLabel(
        `${client.translate({
          key: 'interactions.wochenplan.next_week',
          options: {
            interpolation: { escapeValue: false },
            week_start_date: nextWeek.format('DD.MM'),
            lng: interaction.locale,
          },
        })}`,
      )
      .setStyle(ButtonStyle.Primary),
  )
}
