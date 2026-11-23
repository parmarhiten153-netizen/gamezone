# GameZone

A small browser-game website hosted with GitHub Pages.

## Games hosted inside this repository

| Game | Type | Entry file |
| --- | --- | --- |
| Neon Racer 3D | Original GameZone 3D WebGL racing game | `games/neon-racer/index.html` |
| Bike Rush 3D | Original GameZone 3D motorcycle traffic game | `games/bike-rush/index.html` |
| Candy Match | GameZone puzzle mini-game | `candy-crush.html` |
| Ludo | Local four-player board game | `ludo.html` |
| Level Devil | Canvas platformer | `level-devil.html` |

All game cards on the homepage open pages on the GameZone site. The homepage does not send players to Poki, Gamebiz, or another game portal.

## Important note about Play Store titles

A title being available on Google Play does not grant permission to copy its APK, source code, art, or levels into this repository. GameZone will only self-host another publisher's game if the publisher supplies an authorized web build or a license that explicitly permits redistribution/hosting. Otherwise, the site can link to the Play Store listing as information, but should not present a clone as the original game.

Neon Racer 3D and Bike Rush 3D are original GameZone games. They are not Play Store versions of other titles. The 3D games use the repository's local Three.js v160 build (`three.min.js`), distributed under the MIT license.

## Local player data

Favorites, recently played games, and the Neon Racer and Bike Rush best scores currently use browser local storage. They stay on the current browser/device. Firebase Authentication and Firestore setup instructions are in [FIREBASE_SETUP.md](FIREBASE_SETUP.md). Account login does not automatically sync a game's score: each game needs its own save/load integration.

## Deploy

The site is a static website and can be published with GitHub Pages from the repository's configured branch/folder.


## Account and cloud sync

- `login.html` provides Firebase email/password and Google sign-in.
- `assets/firebase-config.js` contains the public Firebase web-app config placeholders. Add your own project values there.
- `assets/gamezone-cloud.js` syncs favorites, recent games, and the best scores for Neon Racer 3D and Bike Rush 3D to each signed-in user's Firestore profile.
- Publish the owner-only rules from `firestore.rules` before testing cloud sync.
- Follow [FIREBASE_SETUP.md](FIREBASE_SETUP.md). Until Firebase is configured, guest data remains local to the current browser.
