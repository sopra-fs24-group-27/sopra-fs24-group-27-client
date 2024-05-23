# SoPra FS24 Group 27 Project - LyricLies🎵

## Project Description
This group project from Group 27 in the Software Engineering Lab FS24 at UZH aims to develop "LyricLies," a multiplayer online game that combines music and emojis. Players use their knowledge of music and non-literal expression skills to identify the "lyric spy" among them. This entertaining social platform promotes the exploration of musical perception and non-verbal communication, thereby enriching the social gaming landscape with educational and fun elements.

## LyricLies🎵

Overview of LyricLies

Number of players: 4 Players

Material: Songs(by [Spotify API](https://developer.spotify.com/documentation/web-api))

At the start of the game, roles are randomly assigned: three players become detectives and one becomes the spy. The spy listens to a different song than the detectives. During the game, each player must describe their song using a limited number of emojis. After two rounds of emoji descriptions, players vote on who they think the spy is. Detectives need to use the emoji clues to identify the spy, while the spy must disguise their true identity. Each player's role is revealed only after the voting ends. If the spy gets 2 or 3 votes, the detectives win! If not, the spy wins!

### Game Setup
After registering and logging in, players can create or join a game room. When creating a new game room, players can customize game preferences, including music genre, artist, and country. After creating the room, the Game ID can be shared with other players to join. Once the room has four players, the room owner can hit the start button, and the fun begins! Just keep your screens and device audio a secret—no peeking or eavesdropping allowed!

### Identity Assignment
To kick off the game, the system uses the Spotify API to randomly select songs. Three players will hear the same song, while the fourth player, the spy, gets a different tune. All players listen to their assigned songs simultaneously for 30 seconds.

### Emoji Description
After listening, each player chooses up to 5 emojis to describe the song they heard, for two rounds. These emojis can reflect the emotions, style, lyrics, or overall vibe. Since no one knows if they are the spy, you can choose to be as vague or detailed as you like.

### Guessing and Voting
Players guess who the spy is based on the emoji descriptions. If the spy gets 2 or 3 votes, the detectives win! If not, the spy wins!

### End of Game
The game comes to an end when the true identity is revealed! (reveal the song of all detective players and show the different song the spy listened to.)

If the spy receives two or more votes, the detective players win; otherwise, the spy wins.

After the game ends, the system updates the scoreboard based on the results.

As the spy, your mission is to blend in and hide your true identity. Can you keep your cover and outsmart the others to claim victory? 🤔

### Emoji Limitation
Due to system limitations, some flag emojis may not display correctly on Windows systems.


## Launch & Deployment
### Prerequisites and Installation
For your local development environment, you will need Node.js.\
We recommend you install the exact version **v20.11.0** which comes with the npm package manager. You can download it [here](https://nodejs.org/download/release/v20.11.0/).\
If you are confused about which download to choose, feel free to use these direct links:

- **MacOS:** [node-v20.11.0.pkg](https://nodejs.org/download/release/v20.11.0/node-v20.11.0.pkg)
- **Windows 32-bit:** [node-v20.11.0-x86.msi](https://nodejs.org/download/release/v20.11.0/node-v20.11.0-x86.msi)
- **Windows 64-bit:** [node-v20.11.0-x64.msi](https://nodejs.org/download/release/v20.11.0/node-v20.11.0-x64.msi)
- **Linux:** [node-v20.11.0.tar.xz](https://nodejs.org/dist/v20.11.0/node-v20.11.0.tar.xz) (use this [installation guide](https://medium.com/@tgmarinho/how-to-install-node-js-via-binary-archive-on-linux-ab9bbe1dd0c2) if you are new to Linux)

If you happen to have a package manager the following commands can be used:

- **Homebrew:** `brew install node@20.11.0`
- **Chocolatey:** `choco install nodejs-lts --version=20.11.0`

After the installation, update the npm package manager to **10.4.0** by running ```npm install -g npm@10.4.0```\
You can ensure the correct version of node and npm by running ```node -v``` and ```npm --version```, which should give you **v20.11.0** and **10.4.0** respectively.\
Before you start your application for the first time, run this command to install all other dependencies, including React:

```npm install```

Next, you can start the app with:

```npm run dev```

Now you can open [http://localhost:3000](http://localhost:3000) to view it in the browser.\
Notice that the page will reload if you make any edits. You will also see any lint errors in the console (use a Chrome-based browser).\
The client will send HTTP requests to the server which can be found [here](https://github.com/HASEL-UZH/sopra-fs24-template-server).\
In order for these requests to work, you need to install and start the server as well.


## Roadmap
Future Features
1. Expanded Song Library: Integrate more diverse music genres and languages to enhance gameplay variety. In the future, we aim to support users in selecting songs from their Spotify playlists.
2. New Gameplay Mechanics: Introduce new skills and abilities for spy and detective players to add more strategic depth and excitement to the game.


## Authors and Acknowledgment
This project was developed by SoPra Group 27 2024:
- Yating Pan - [GitHub](https://github.com/YatingPan)
- Hepeng Fan - [GitHub](https://github.com/HepengFan)
- Qingcheng Wang - [GitHub](https://github.com/QingchengWan)
- Yuying Zhong - [GitHub](https://github.com/YuyingZhong)
- Yi Zhang - [GitHub](https://github.com/imyizhang)

We would like to thank our teaching assistant Sven [GitHub](https://github.com/SvenRingger) for his help throughout the semester. We also thank Spotify for providing its API, and the game of "Who Is Spy" for inspiring our idea. This semester has proven to be both challenging and intriguing, offering us valuable opportunities for growth, as we acquired extensive knowledge not only in coding but also in teamwork and project execution. We appreciate the opportunity and the experience gained from this project.

## License
MIT License

Copyright (c) [2024] [SoPra FS24 Group 27]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

