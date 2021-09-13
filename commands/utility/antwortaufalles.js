const config = require("../../private/config.json")

exports.name = "antwortaufalles"

exports.description = "Was ist die Antwort auf alles?"

exports.usage = `${config.prefix}antwortaufalles`

exports.run = async (client, message) => {
	return message.reply(
		"Die Antwort auf die Frage nach dem Leben, dem Universum und dem ganzen Rest ist :four::two:"
	)
}
