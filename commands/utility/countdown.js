const config = require("../../private/config.json")
const discord = require("discord.js")

exports.name = "countdown"

exports.description = "Ein simpler countdown von 10 runter"

exports.usage = `${config.prefix}countdown`

exports.run = async (client, message) => {
	let msgEmbed = new discord.MessageEmbed()
		.setTitle("Liftoff in:")
		.setFooter(message.author.tag, message.author.avatarURL({ dynamic: true }))
		.setThumbnail(
			"https://upload.wikimedia.org/wikipedia/commons/3/33/Cartoon_space_rocket.png"
		)
	let msg = await message.reply({
		embeds: [msgEmbed.setDescription(`🚀10🚀`)]
	})
	// counts only 8, 6, 4, 3, 2, 1, 0 and skips 9, 7, 5 due to API limits
	for (let i = 9; i >= 0; i--) {
		if (i > 3) {
			if (i % 2 == 0) {
				setTimeout(() => {
					msg.edit({ embeds: [msgEmbed.setDescription(`🚀${i}🚀`)] })
				}, 1000 * (10 - i))
			}
		} else {
			setTimeout(() => {
				if (i == 0)
					msg.edit({ embeds: [msgEmbed.setTitle("Abfluuug").setDescription(`🚀Abgehoben🚀`)] })
				else msg.edit({ embeds: [msgEmbed.setDescription(`🚀${i}🚀`)] })
			}, 1000 * (10 - i))
		}
	}
}
