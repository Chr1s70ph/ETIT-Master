import { DiscordClient } from "../types/customTypes"
import { scheduleJob } from "node-schedule"
const presence_refresh_timer = "15 * * * * *"
const custom_presence = require("../commands/admin/status.ts")

exports.run = async (client: DiscordClient) => {
	const presenceVariants = client.config.presence
	var maxNumberOfPresence = Object.keys(presenceVariants).length
	var minNumberOfPresence = 0
	var keys = Object.keys(presenceVariants)

	scheduleJob(presence_refresh_timer, function () {
		let customPresence = custom_presence.presence
		if (customPresence.activities[0].name != "") {
			client.user.setPresence(customPresence)
		} else {
			var randomIndex = Math.floor(
				Math.random() * (maxNumberOfPresence - minNumberOfPresence) + minNumberOfPresence
			)
			client.user.setPresence(presenceVariants[randomIndex])
		}
	})
}
