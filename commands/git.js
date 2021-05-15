const discord = require('../node_modules/discord.js');
const config = require("../privateData/config.json");
const gitlab = "https://git.scc.kit.edu"
const github = "https://git.io/J3Vao";


exports.run = (client, message) => {

    const git = new discord.MessageEmbed() //Login Embed
    .setColor('#ffa500')
    .setAuthor(client.user.tag, 'https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png')
    .setThumbnail("https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png")
    .setTitle('[🌐] GIT Wiki')
    .setURL("https://git-scm.com/book/en/v2")
        .addFields(        
        { name: 'Gitlab:', value: `[Link](${gitlab}) zur Gitlab Startseite`, inline: false },        
        { name: `Github:`, value: `Github [Repository](${github}) von <@${config.ids.userID.botUserID}>`, inline: false },        
        { name: '\u200B', value: '\u200B' }        
        )
    .setFooter(`[ID] ${config.ids.userID.botUserID} \n`, 'https://about.gitlab.com/images/press/logo/png/gitlab-icon-rgb.png');



    message.channel.send(git.setTimestamp());
}