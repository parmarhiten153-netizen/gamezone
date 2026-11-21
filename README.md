# GameZone

A small browser-game website hosted with GitHub Pages.

## Games hosted inside this repository

| Game | Type | Entry file |
| --- | --- | --- |
| Neon Racer 3D | Original GameZone 3D WebGL racing game | `games/neon-racer/index.html` |
| Candy Match | GameZone puzzle mini-game | `candy-crush.html` |
| Ludo | Local four-player board game | `ludo.html` |
| Level Devil | Canvas platformer | `level-devil.html` |

All game cards on the homepage open pages on the GameZone site. The homepage does not send players to Poki, Gamebiz, or another game portal.

## Important note about Play Store titles

A title being available on Google Play does not grant permission to copy its APK, source code, art, or levels into this repository. GameZone will only self-host another publisher's game if the publisher supplies an authorized web build or a license that explicitly permits redistribution/hosting. Otherwise, the site can link to the Play Store listing as information, but should not present a clone as the original game.

Neon Racer 3D is an original GameZone game. It is not the Play Store version of another title.

## Local player data

Favorites, recently played games, and the Neon Racer best score currently use browser local storage. They stay on the current browser/device. Firebase Authentication and Firestore setup instructions are in [FIREBASE_SETUP.md](FIREBASE_SETUP.md). Account login does not automatically sync a game's score: each game needs its own save/load integration.

## Deploy

The site is a static website and can be published with GitHub Pages from the repository's configured branch/folder.
