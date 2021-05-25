let help = require("../slashCommands/slashHelp.js")
let ping = require("../slashCommands/slashPing.js")
let info = require("../slashCommands/slashInfo.js");
let config = require('../privateData/config.json');

exports.run = async (client) => {
    await help.help(client);
    await ping.Ping(client);
    await info.info(client);
}


// Code to get all posted Interactions, log them, and delete them (by id)
// async function GetPostsDelete(client) {
    // const interactions = await client.api.applications(client.user.id).guilds(config.ids.serverID).commands.get();
    // const interactions = await client.api.applications(client.user.id).commands.get();

    // console.log(interactions);
    // client.api.applications(client.user.id).guilds(config.ids.serverID).commands('idHERE').delete();
    // client.api.applications(client.user.id).commands('idHERE').delete();
//     console.log(interactions);
// }