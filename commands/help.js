exports.run = (client, message) => {
    message.delete();
    message.reply("🛠 Dir wurde Hilfe geschickt!");
    message.author.send("```asciidoc\n = Die Hauptfunktion des Bots ist es, an Vorlesungen und in Zukunft auch an Tutorien zu erinnern =\n----------" +
        "\nVorlesungserinnerung :: Der Bot schickt automatisch in den Channel des jeweiligen Faches 5 Minuten vor Vorlesungsbeginn einen Link zum jeweiligen Zoom-Meeting (oder zur YouTube Playlist bei Experimental Physik." +
        "\nDa es bei der höheren Mathematik jedoch immer einen neuen Link gibt, erinnert der Bot lediglich daran, die Emails zu überprüfen."+
        "\n" +
        "```");
    message.author.send("```asciidoc\n= Das ist die Hilfeseite der Befehle! =\nHier werden alle Befehle aufgelistet\n----------" +
        "\nping :: gibt die Ping werte zum Bot und zur API aus"+
        "\n" +
        "```");
}


