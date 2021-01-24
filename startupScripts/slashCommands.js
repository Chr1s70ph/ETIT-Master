exports.postAndRun = postAndRun;
let help = require("../slashCommands/slashHelp.js")
let ping = require("../slashCommands/slashPing.js")
let info = require("../slashCommands/slashInfo.js")

async function postAndRun(client, message) {
    await help.help(client, message);
    await ping.Ping(client);
    await info.info(client);
}


////Code to get all posted Interactions, log them, and delete them (by id)
// async function GetPostsDelete(client) {
//     const interactions = await client.api.applications(client.user.id).guilds('757981349402378331').commands.get();
    
//     console.log(interactions);
//     const deleted = await client.api.applications(client.user.id).guilds('757981349402378331').commands('798855175653687296').delete();
//     console.log(deleted);
// }