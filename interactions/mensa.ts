import * as fs from 'fs'
import * as https from 'https'
import { SlashCommandBuilder } from '@discordjs/builders'
import { MessageEmbed } from 'discord.js'
import { DiscordClient, DiscordCommandInteraction } from '../types/customTypes'
const { DateTime } = require('luxon')

const weekdays = {
  montag: {
    name: 'montag',
    value: 'mo',
  },
  dienstag: {
    name: 'dienstag',
    value: 'di',
  },
  mittwoch: {
    name: 'mittwoch',
    value: 'mi',
  },
  donnerstag: {
    name: 'donnerstag',
    value: 'do',
  },
  freitag: {
    name: 'freitag',
    value: 'fr',
  },
}

const weekday_choices: [string, string][] = new Array([null, null])

/**
 * Add choices to Array
 */
for (const entry in weekdays) {
  const choice: [string, string] = [weekdays[entry].name, weekdays[entry].value]
  weekday_choices.push(choice)
}
weekday_choices.shift()

const lines = {
  adenauer: {
    name: 'am adenauerring',
    value: 'adenauerring',
  },
  erzberg: {
    name: 'erzbergstraße',
    value: 'erzberger',
  },
  schloss: {
    name: 'achloss gottesaue',
    value: 'gottesaue',
  },
  tiefbronner: {
    name: 'tiefbronner straße',
    value: 'tiefenbronner',
  },
  cafetaria: {
    name: 'caféteria moltkestraße 30',
    value: 'x1moltkestrasse',
  },
}

const line_choices: [string, string][] = new Array([null, null])

/**
 * Add choices to Array
 */
for (const entry in lines) {
  const choice: [string, string] = [lines[entry].name, lines[entry].value]
  line_choices.push(choice)
}
line_choices.shift()

export const data = new SlashCommandBuilder()
  .setName('mensa')
  .setDescription('Was es wohl heute zu Essen gibt?')
  .addStringOption(option =>
    option
      .setName('wochentag')
      .setDescription('Der Wochentag, der angezeigt werden soll.')
      .addChoices(weekday_choices)
      .setRequired(true),
  )
  .addStringOption(option =>
    option
      .setName('ort')
      .setDescription('Die Mensa, die angezeigt werden soll.')
      .addChoices(line_choices)
      .setRequired(true),
  )

exports.Command = async (client: DiscordClient, interaction: DiscordCommandInteraction): Promise<void> => {
  await mensa(client, interaction, interaction.options.getString('wochentag'), interaction.options.getString('ort'))
}

class FoodLine {
  constructor(pName, pValue) {
    this.name = pName
    this.value = pValue
  }
  name
  value
}

class Weekday {
  constructor(pName, pIndex) {
    this.name = pName
    this.index = pIndex
  }
  name
  index
}

const mensaOptions = {
  adenauerring: {
    name: 'Am Adenauerring',
    foodLines: [
      new FoodLine('l1', 'Linie 1'),
      new FoodLine('l2', 'Linie 2'),
      new FoodLine('l3', 'Linie 3'),
      new FoodLine('l45', 'Linie 4'),
      new FoodLine('l5', 'Linie 5'),
      new FoodLine('schnitzelbar', 'Schnitzelbar'),
      new FoodLine('aktion', '[Kœri]werk 11-14 Uhr'),
      new FoodLine('pizza', '[pizza]werk'),
    ],
  },
  erzberger: {
    name: 'Erzbergstraße',
    foodLines: [
      new FoodLine('wahl1', 'Wahlessen 1'),
      new FoodLine('wahl2', 'Wahlessen 2'),
      new FoodLine('wahl3', 'Wahlessen 3'),
    ],
  },
  gottesaue: {
    name: 'Schloss Gottesaue',
    foodLines: [new FoodLine('wahl1', 'Wahlessen 1'), new FoodLine('wahl2', 'Wahlessen 2')],
  },
  tiefenbronner: {
    name: 'Tiefbronner Straße',
    foodLines: [
      new FoodLine('wahl1', 'Wahlessen 1'),
      new FoodLine('wahl2', 'Wahlessen 2'),
      new FoodLine('gut', 'Gut & Günstig'),
      new FoodLine('buffet', 'Buffet'),
      new FoodLine('curryqueen', '[Kœri]werk'),
    ],
  },
  holzgarten: {
    name: 'Holzgartenstraße',
    foodLines: [new FoodLine('gut', 'Gut & Günstig 1'), new FoodLine('gut2', 'Gut & Günstig 2')],
  },
  x1moltkestrasse: {
    name: 'Caféteria Moltkestraße 30',
    foodLines: [new FoodLine('gut', 'Gut & Günstig')],
  },
}

const weekdayOptions = {
  mo: new Weekday('Montag', 0),
  di: new Weekday('Dienstag', 1),
  mi: new Weekday('Mittwoch', 2),
  do: new Weekday('Donnerstag', 3),
  fr: new Weekday('Freitag', 4),
  sa: new Weekday('Samstag', 5),
  so: new Weekday('Sonntag', 6),
}

function _updateJson(client: DiscordClient, interaction: DiscordCommandInteraction): Promise<string> {
  return new Promise((resolve, reject) => {
    /**
     * Fancy API stuff and user credential hashing
     */
    const options = {
      host: client.config.mensa.base_url,
      port: 443,
      path: client.config.mensa.api,
      headers: {
        Authorization: `Basic ${Buffer.from(`${client.config.mensa.user}:${client.config.mensa.password}`).toString(
          'base64',
        )}`,
      },
    }

    let body = ''
    /**
     * Work with API response
     */
    https.get(options, res => {
      res.on('data', return_data => {
        body += return_data
      })
      res.on('error', error => {
        /**
         * TODO: valid error handling
         */
        interaction.reply(`Error, sadface\n${error}`)
        reject(error)
      })
      res.on('end', () => {
        /**
         * Write to file to restrict unnecessary API calls.
         */
        fs.writeFile(`data/mensa.json`, body, { flag: 'w+' }, err => {
          if (err) {
            /**
             * TODO: valid error handling
             */
            interaction.followUp('Sadface')
            reject(err)
          }
          resolve(body)
        })
      })
    })
  })
}

async function mensa(client: DiscordClient, interaction: DiscordCommandInteraction, req_weekday, req_mensa) {
  /**
   * Mensa embed
   */
  const embed = new MessageEmbed().setColor('#FAD51B').setAuthor({ name: '🍽️ Mensaplan' })

  let raw_mensa, mensa_json
  if ((await fs.promises.readFile(`data/mensa.json`)).toString().length === 0) {
    /**
     * Fetch new mensa plan if none found
     */
    const buffer = await _updateJson(client, interaction)
    if (buffer) mensa_json = JSON.parse(buffer)
  } else {
    /**
     * Read mensa plan if found
     */
    raw_mensa = (await fs.promises.readFile(`data/mensa.json`)).toString()
    mensa_json = JSON.parse(raw_mensa)
  }

  const requestedWeekdayIndex = weekdayOptions[req_weekday].index
  const currentWeekday = new Date().getDay() - 1

  let requestedDifference = null

  if (requestedWeekdayIndex - currentWeekday <= 0) {
    /**
     * If in past, search next week :)
     */
    requestedDifference = Object.keys(weekdayOptions).length - currentWeekday + requestedWeekdayIndex
  } else {
    requestedDifference = requestedWeekdayIndex - currentWeekday
  }

  const currentDate = Date.now()
  const lastDate: number = +Object.keys(mensa_json.adenauerring)[Object.keys(mensa_json.adenauerring).length - 1] * 1000

  if (currentDate + 7 * 86400000 > lastDate) {
    // 7 * 86400 : number of seconds in one week
    embed.setDescription(client.translate({ key: 'interactions.mensa.refreshJSON', lng: interaction.user.language }))

    interaction.channel.send({
      embeds: [embed],
    })

    const buffer = await _updateJson(client, interaction)
    if (buffer) mensa_json = JSON.parse(buffer)

    mensa_json = await fs.promises.readFile(`data/mensa.json`)
  }

  if (Object.keys(mensa_json).indexOf(req_mensa) === -1) {
    embed
      .setTitle(
        `${client.translate({ key: 'interactions.mensa.cafeteria', lng: interaction.user.language })} ${
          mensaOptions[req_mensa].name
        }`,
      )
      .setDescription(client.translate({ key: 'interactions.mensa.lineClosed', lng: interaction.user.language }))

    interaction.reply({
      embeds: [embed],
    })
  }

  for (const timestampKey in Object.keys(mensa_json[req_mensa])) {
    const timestamp: number = +Object.keys(mensa_json[req_mensa])[timestampKey]

    if (timestamp * 1000 > currentDate - 86400000 + 86400000 * requestedDifference) {
      // # 86400000 number of miliseconds in one day

      /**
       * Fight with JS Date format
       * It works, don't touch it
       */
      const tempDay = DateTime.fromMillis(timestamp * 1000).toString()
      tempDay.toLocaleString('en-US', { timezone: 'Berlin/Europe' })
      const dayString = `${tempDay.slice(0, -10)}Z`
      const date = new Date(dayString)

      embed
        .setTitle(
          `${client.translate({ key: 'interactions.mensa.cafeteria', lng: interaction.user.language })} ${
            mensaOptions[req_mensa].name
          }`,
        )
        .setDescription(
          `${date.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' })}`,
        )

      for (const foodLineIndex in mensaOptions[req_mensa].foodLines) {
        const foodLine = mensaOptions[req_mensa].foodLines[foodLineIndex].name
        let mealValues = ''

        for (const foodLineDataIndex in mensa_json[req_mensa][timestamp][foodLine]) {
          const foodLineData = mensa_json[req_mensa][timestamp][foodLine][foodLineDataIndex]

          // eslint-disable-next-line max-depth
          if (foodLineData.nodata) {
            mealValues = client.translate({ key: 'interactions.mensa.noInformation', lng: interaction.user.language })
            break
          }

          // eslint-disable-next-line max-depth
          if (foodLineData.closing_start) {
            mealValues = client.translate({
              key: 'interactions.mensa.closed',
              options: { reason: foodLineData.closing_text, lng: interaction.user.language },
            })
            break
          }

          const price = ` (${foodLineData.price_1 === 0 ? '0.00' : foodLineData.price_1.toFixed(2)}€)`
          const meal = `__${foodLineData.meal} ${price}__\n`
          const dish = foodLineData.dish

          mealValues += ['', '.'].indexOf(dish) === -1 ? `${meal}${dish}\n` : meal

          const allAdditives = foodLineData.add.join(', ')

          mealValues +=
            allAdditives !== ''
              ? client.translate({
                  key: 'interactions.mensa.foodAdditives',
                  options: { additives: allAdditives, lng: interaction.user.language },
                })
              : client.translate({ key: 'interactions.mensa.noFoodAdditives', lng: interaction.user.language })

          const foodContainsStringToEmoji = {
            bio: ':earth_africa:',
            fish: ':fish:',
            pork: ':pig2:',
            pork_aw: ':pig:',
            cow: ':cow2:',
            cow_aw: ':cow:',
            vegan: ':broccoli:',
            veg: ':salad:',
            mensa_vit: 'Mensa Vital',
          }

          // eslint-disable-next-line max-depth
          for (const [foodContainsKey, foodContainsVal] of Object.entries(foodContainsStringToEmoji)) {
            // eslint-disable-next-line max-depth
            if (foodLineData[foodContainsKey]) {
              mealValues += ` ${foodContainsVal}`
            }
          }

          mealValues += '\n\n'
        }

        if (mealValues) {
          embed.addFields({
            name: `⠀\n:arrow_forward: ${mensaOptions[req_mensa].foodLines[foodLineIndex].value} :arrow_backward:`,
            value: `${mealValues}\n`,
            inline: true,
          })
        }
      }
      break
    }
  }

  embed.addFields({
    name: '⠀',
    value: client.translate({
      key: 'interactions.mensa.allAdditivesList',
      options: {
        link: client.config.mensa.base_url + client.config.mensa.additional_info,
        lng: interaction.user.language,
      },
    }),
    inline: false,
  })

  interaction.reply({ embeds: [embed] })
}
