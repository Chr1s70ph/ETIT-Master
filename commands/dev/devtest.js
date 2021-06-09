const config = require("../../privateData/config.json");
const {
    MessageButton,
    MessageActionRow
} = require('discord-buttons');
const discord = require('discord.js');


exports.run = async (client, message) => {
    if (message.author != config.ids.userID.ownerID) return message.reply('You do not have the permissions to perform that command.');

    const myEmbed = new discord.MessageEmbed() //Login Embed
        .setColor('#ffa500')
        .setAuthor(client.user.tag, 'https://www.iconsdb.com/icons/preview/orange/code-xxl.png')
        .setThumbnail(client.guilds.resolve(config.ids.serverID).members.resolve(config.ids.userID.botUserID).user.avatarURL())
        .setTitle('Test Embed')
        .addFields({
            name: 'Test here',
            value: 'Im just here to test stuff',
            inline: true
        })
        .setFooter(`[ID] ${config.ids.userID.botUserID} \nstarted`, 'https://image.flaticon.com/icons/png/512/888/888879.png');



    let neverGonnaGiveYouUp = new MessageButton()
        .setStyle('url')
        .setLabel('Hi')
        .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');


    let replyTest = new MessageButton()
        .setStyle('red')
        .setLabel('Test')
        .setID('test_id2')


    let emojiButton = new MessageButton()
        .setStyle('green')
        .setLabel("I Like")
        .setEmoji("👌")
        .setID("emojiButton")

    let row = new MessageActionRow()
        .addComponent(neverGonnaGiveYouUp)
        .addComponent(replyTest)

    let row2 = new MessageActionRow()
        .addComponent(emojiButton)


    message.channel.send({
        components: [row, row2],
        embed: myEmbed
    });




    let linkButton = new MessageButton()
        .setStyle('url')
        .setLabel('In Zoom öffnen')
        .setURL("https://www.google.com")
        .setEmoji('776402157334822964')


    let rowa = new MessageActionRow()
        .addComponent(linkButton)

    message.channel.send({
        components: [rowa],
        embed: myEmbed.setTimestamp()
    })

    client.on('clickButton', async (button) => {
        if (button.id === 'test_id1') {
            button.reply.send(`<@${button.clicker.user.id}> you have fallen into my trap card`, true)
        }

        if (button.id === 'test_id2') {
            button.reply.send(`Hallo du neugieriger Mensch :3`, true);
        }

        if (button.id === 'emojiButton') {
            await button.message.edit("You hit me!", {
                components: [row, row2]
            });
            button.defer();
        }
    })
}