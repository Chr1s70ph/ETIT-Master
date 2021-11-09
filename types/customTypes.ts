import { Client } from 'discord.js'

export class DiscordClient extends Client {
  public commands
  public config
  public applications: {
    youtube: string
    youtubedev: string
    poker: string
    betrayal: string
    fishing: string
    chess: string
    chessdev: string
    lettertile: string
    wordsnack: string
    doodlecrew: string
    awkword: string
    spellcast: string
  }
}
