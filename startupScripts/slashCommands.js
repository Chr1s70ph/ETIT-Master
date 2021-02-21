exports.postAndRun = postAndRun;
let help = require("../slashCommands/slashHelp.js")
let ping = require("../slashCommands/slashPing.js")
let info = require("../slashCommands/slashInfo.js");
var private = require('../private.js');
const serverId = private.serverId;

async function postAndRun(client) {
    await help.help(client);
    await ping.Ping(client);
    await info.info(client);
}


// Code to get all posted Interactions, log them, and delete them (by id)
// async function GetPostsDelete(client) {
//     const interactions = await client.api.applications(client.user.id).guilds(serverId).commands.get();

//     console.log(interactions);
//     client.api.applications(client.user.id).guilds(serverId).commands('777313468377858059').delete();
//     console.log(interactions);
// }