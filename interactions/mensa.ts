import * as fs from 'fs'
import * as https from 'https'
import { SlashCommandBuilder } from '@discordjs/builders'
import { MessageEmbed } from 'discord.js'
import { DiscordClient, DiscordCommandInteraction } from '../types/customTypes'

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
  const choice: [string, string] = [entry, entry]
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
  const choice: [string, string] = [entry, entry]
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
      .setName('linie')
      .setDescription('Die Mensa, die angezeigt werden soll.')
      .addChoices(line_choices)
      .setRequired(true),
  )

exports.Command = async (client: DiscordClient, interaction: DiscordCommandInteraction): Promise<void> => {
  await interaction.reply({
    content: 'Work in Progress',
    embeds: [
      new MessageEmbed()
        .setAuthor({ name: 'Shush' })
        .setDescription('Feddes schnidsel mit Rahmensoße und grünen Erbsen'),
    ],
  })
}

/**
 * TODO:
 * - Fix classes
 * - Understand Buffer things in @link{_updateJson}
 */

class FoodLine {
  constructor(pName, pValue) {
    this.name = pName
    this.value = pValue
  }
}

class Weekday {
  constructor(pName, pIndex) {
    this.name = pName
    this.index = pIndex
  }
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

async function _updateJson(pClient, pMessage) {
  const channel = pMessage ? pMessage.channel : pClient.channels.cache.get(id.channelId.BOT_TEST_LOBBY)

  const options = {
    host: url.MENSA.API_HOST,
    port: 443,
    path: url.MENSA.API_PATH,
    headers: {
      Authorization: `Basic ${new Buffer.from(`${loginData.MENSA.USER}:${loginData.MENSA.PWD}`).toString('base64')}`,
    },
  }

  await https.get(options, res => {
    let body = ''
    res.on('data', data => {
      body += data
    })
    res.on('end', () => {
      fs.writeFile(`${settings.path}private/cache/mensa.txt`, body, { flag: 'w+' }, err => {
        if (err) {
          sendErrorMessageHelper.sendErrorMessageToChannel(
            pClient,
            channel,
            `Error: \`_updateJson()\`: Datei konnte nicht gespeichert werden.`,
            `${mdHelper.withStyle('js', err)}`,
          )
          return false
        }
      })
    })
    res.on('error', e => {
      sendErrorMessageHelper.sendErrorMessageToChannel(
        pClient,
        channel,
        `Error: \`_updateJson()\`: Fehler beim API-Aufruf.`,
        `${mdHelper.withStyle('js', e.message)}`,
      )
      return false
    })
  })
  return true
}

async function _loadJSON() {
  const data = await fs.promises.readFile(`${settings.path}private/cache/mensa.txt`)
  return JSON.parse(data)
}

async function mensa(pClient, pMessage, pRequestedWeekday, pRequestedMensa): Promise<MessageEmbed> {
  const embed = embedHelper.constructDefaultEmbed(pClient).setColor('#FAD51B').setAuthor('🍽️ Mensaplan')

  let jsonData = await _loadJSON()

  let requestedWeekdayIndex = null
  let requestedDifference = null

  const currentWeekday = new Date().getDay() - 1

  if (!pRequestedWeekday) {
    if (currentWeekday > 4) {
      pRequestedWeekday = 'mo'
      requestedWeekdayIndex = 0
      requestedDifference = 0
    } else {
      const modifyDate = new Date().getHours() >= 15 ? 1 : 0
      for (const weekday in weekdayOptions) {
        if (weekdayOptions[weekday].index === currentWeekday + modifyDate) {
          pRequestedWeekday = weekday
          requestedWeekdayIndex = currentWeekday + modifyDate
          requestedDifference = modifyDate
        }
      }
    }
  } else {
    requestedWeekdayIndex = weekdayOptions[pRequestedWeekday].index
    if (requestedWeekdayIndex - currentWeekday <= 0) {
      requestedDifference = Object.keys(weekdayOptions).length - currentWeekday + requestedWeekdayIndex
    } else {
      requestedDifference = requestedWeekdayIndex - currentWeekday
    }
  }

  /**
   * Date without milliseconds.
   */
  const currentDate = Math.round(Date.now() / 1000)
  const lastDate: number = +Object.keys(jsonData.adenauerring)[Object.keys(jsonData.adenauerring).length - 1]

  if (currentDate + 7 * 86400 > lastDate) {
    // 7 * 86400 : number of seconds in one week
    embed.setDescription(':fork_knife_plate: Aktualisiere JSON...')

    pMessage.channel.send({
      embeds: [embed],
    })

    if (!(await _updateJson(pClient, pMessage))) {
      return
    }

    jsonData = await _loadJSON()
  }

  if (Object.keys(jsonData).indexOf(pRequestedMensa) === -1) {
    embed
      .setTitle(`Mensa ${mensaOptions[pRequestedMensa].name}`)
      .setDescription('Diese Mensa hat am angeforderten Tag leider geschlossen.')

    pMessage.channel.send({
      embeds: [embed],
    })

    return null
  }

  for (const timestampKey in Object.keys(jsonData[pRequestedMensa])) {
    const timestamp: number = +Object.keys(jsonData[pRequestedMensa])[timestampKey]

    if (timestamp > currentDate - 86400 + 86400 * requestedDifference) {
      // # 86400 number of seconds in one day

      const date = new Date(timestamp * 1000)
      date.setDate(date.getDate() + 1)

      embed
        .setTitle(`Mensa ${mensaOptions[pRequestedMensa].name}`)
        .setDescription(
          `${date.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' })}`,
        )

      for (const foodLineIndex in mensaOptions[pRequestedMensa].foodLines) {
        const foodLine = mensaOptions[pRequestedMensa].foodLines[foodLineIndex].name
        let mealValues = ''

        for (const foodLineDataIndex in jsonData[pRequestedMensa][timestamp][foodLine]) {
          const foodLineData = jsonData[pRequestedMensa][timestamp][foodLine][foodLineDataIndex]

          // eslint-disable-next-line max-depth
          if (foodLineData.nodata) {
            mealValues = '__Leider gibt es für diesen Tag hier keine Informationen!__'
            break
          }

          // eslint-disable-next-line max-depth
          if (foodLineData.closing_start) {
            mealValues = `__Leider ist hier heute geschlossen. Grund: ${foodLineData.closing_text}__`
            break
          }

          const price = ` (${foodLineData.price_1 === 0 ? '0.00' : foodLineData.price_1.toFixed(2)}€)`
          const meal = `__${foodLineData.meal} ${price}__\n`
          const dish = foodLineData.dish

          mealValues += ['', '.'].indexOf(dish) === -1 ? `${meal}${dish}\n` : meal

          const allAdditions = foodLineData.add.join(', ')

          mealValues += allAdditions !== '' ? `_Zusatz: [${allAdditions}]_` : '_Keine Zusätze_'

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
            name: `⠀\n:arrow_forward: ${mensaOptions[pRequestedMensa].foodLines[foodLineIndex].value} :arrow_backward:`,
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
    value: `Eine Liste aller Zusätze findest du [hier](${url.MENSA.ADD_URL_NO_DOWNLOAD}).`,
    inline: false,
  })

  return embed
}

async function daily_mensa(pClient) {
  const msg = new Discord.Message(pClient, {
    channel_id: id.channelId.MENSA,
    guild_id: id.serverId.ETIT_KIT,
    id: '123456789101112',
    content: `${settings.prefix}mensa`,
    author: { id: pClient.user.id },
    channel: pClient.channels.cache.get(id.channelId.MENSA),
  })

  mensa_switcher(pClient, msg)
  setInterval(() => {
    mensa_switcher(pClient, msg)
  }, 86400000) // 86400000 milliseconds are in a day
}

async function mensa_switcher(pClient, pMessageOrInteraction) {
  let msg = null

  if (pMessageOrInteraction instanceof Discord.Message) {
    let requestedWeekday = null
    let requestedMensa = 'adenauerring'
    const params = pMessageOrInteraction.content.split(' ').map(elem => elem.toLowerCase())

    for (const weekday in weekdayOptions) {
      if (params.indexOf(weekday) != -1) {
        requestedWeekday = weekday
        const requestedWeekdayIndex = weekdayOptions[weekday].index
        if (requestedWeekdayIndex > weekdayOptions.fr.index) {
          sendErrorMessageHelper.sendErrorMessage(
            pClient,
            pMessageOrInteraction,
            `Error: Ungültiger Wert für {TAG}`,
            `Der Mensaplan kann nur für Werktage angezeigt werden.`,
          )
          return
        }
      }
    }

    for (const mensaKey in mensaOptions) {
      if (params.indexOf(mensaKey) !== -1) {
        requestedMensa = mensaKey
      }
    }

    const embed = await mensa(pClient, pMessageOrInteraction, requestedWeekday, requestedMensa)

    msg = await pMessageOrInteraction.channel.send({
      embeds: [embed],
    })
  } else {
    let requestedWeekday = null
    let requestedMensa = 'adenauerring'
    switch (pMessageOrInteraction.options._hoistedOptions.length) {
      case 1:
        if (pMessageOrInteraction.options.data[0].name === 'wochentag') {
          requestedWeekday = pMessageOrInteraction.options.data[0].value
        } else {
          requestedMensa = pMessageOrInteraction.options.data[0].value
        }
        break
      case 2:
        if (pMessageOrInteraction.options.data[0].name === 'wochentag') {
          requestedWeekday = pMessageOrInteraction.options.data[0].value
          requestedMensa = pMessageOrInteraction.options.data[1].value
        } else {
          requestedMensa = pMessageOrInteraction.options.data[1].value
          requestedMensa = pMessageOrInteraction.options.data[0].value
        }
        break
    }

    const embed = await mensa(pClient, pMessageOrInteraction, requestedWeekday, requestedMensa)

    msg = await pMessageOrInteraction.reply({
      embeds: [embed],
      ephemeral: true,
    })
  }

  if (msg.channel.type === 'GUILD_NEWS') {
    console.log('news')
    await msg.crosspost()
  }
}

module.exports.run = mensa_switcher
module.exports.slash = mensa_switcher
module.exports.daily_mensa = daily_mensa
