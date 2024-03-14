# SoPra FS24 Group 27 Project - LyricLies🎵

## Authors
- Yating Pan - [GitHub](https://github.com/YatingPan)
- Xueying Cheng - [GitHub](https://github.com/XueyingCheng)
- Hepeng Fan - [GitHub](https://github.com/HepengFan)
- Qingcheng Wan - [GitHub](https://github.com/QingchengWan)
- Yuying Zhong - [GitHub](https://github.com/YuyingZhong)

## Project Description
This group project from Group 27 in the Software Engineering Lab FS24 at UZH aims to develop "LyricLies," a multiplayer online game that combines music and emojis. Players use their knowledge of music and non-literal expression skills to identify the "lyric spy" among them. This entertaining social platform promotes the exploration of musical perception and non-verbal communication, thereby enriching the social gaming landscape with educational and fun elements.

## LyricLies🎵

The objective of LyricLies is to identify the spy who listens to a different song, using emojis to describe their song. The game supports 4 players and utilizes songs from the [Spotify API](https://developer.spotify.com/documentation/web-api) to assign identities to each player. Suitable for audiences aged 10 and up, the game begins with each player assigned a song, but only one player receives a different track. Throughout two rounds of emoji descriptions, players must then vote to guess the spy. If the spy is correctly identified, the non-spy players win; otherwise, the spy claims victory.

### Game Setup
After registration and login, players can create or join a game room. The game starts once four players are present, initiated by the room owner. Privacy during gameplay is crucial to ensure fair play.

### Identity Assignment
The system randomly selects songs through the Spotify API, assigning the same song to three players and a different one to the spy. All players listen to their song for 30 seconds simultaneously.

### Emoji Description
Post-listening, players have 60 seconds to select up to five emojis to describe their song, taking turns. The choice of emojis can reflect the song's mood, style, lyrics, or vibe. Players must be strategic in their descriptions, as the spy's identity is unknown.

### Guessing and Voting
After two rounds of description, a two-minute discussion phase allows players to speculate on the spy's identity, followed by a voting phase.

### End of Game
The game concludes by revealing the true identities and songs, determining the winning side based on the votes. Players' scores are updated accordingly, rewarding strategic deception and deduction.

Embark on a journey of musical espionage - can you outsmart your friends and win the game of LyricLies? 🤔
