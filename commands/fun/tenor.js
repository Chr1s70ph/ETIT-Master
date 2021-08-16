const config = require("../../private/config.json")
const discord = require("discord.js")
const Tenor = require("tenorjs").client(config.tenor)
const mention_Regex = /<@!?(\d{17,19})>/g

exports.name = "tenor"

exports.description = "send gifs"

exports.usage = `${config.prefix}tenor <searchQuery>\n${config.prefix}gif <searchQuery>`

exports.aliases = ["gif"]

exports.run = (client, message, args) => {
	const embed = new discord.MessageEmbed().setFooter(
		message.author.tag,
		message.author.avatarURL({ dynamic: true })
	)

	const userPing = args.find((value) => discord.MessageMentions.USERS_PATTERN.test(value))

	args = removeMatching(args, discord.MessageMentions.USERS_PATTERN)

	let searchQuery = ""
	for (word in args) {
		searchQuery = searchQuery + args[word] + " "
	}

	if (searchQuery.length == 0) {
		return message.channel.send("Bitte gebe einen suchwort an!")
	}

	Tenor.Search.Random(searchQuery, "1").then((Results) => {
		if (Results.length == 0) {
			embed.setDescription(
				`<@${message.author.id}> Es konnten keine Gifs gefunden werden für: '${searchQuery}'`
			)
			return message.channel.send({ embeds: [embed] })
		}
		Results.forEach((Post) => {
			let gifUrl = Post.media.find((element) => element.hasOwnProperty("gif")).gif.url
			embed.setImage(gifUrl)
		})
		message.channel.send({
			content: userPing,
			embeds: [embed]
		})
	})
}

//https://stackoverflow.com/a/3661083/10926046
function removeMatching(originalArray, regex) {
	var j = 0
	while (j < originalArray.length) {
		if (regex.test(originalArray[j])) originalArray.splice(j, 1)
		else j++
	}
	return originalArray
}
