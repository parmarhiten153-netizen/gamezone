# GameZone Firebase setup

This connects real accounts and cloud sync for the GameZone profile. The site remains usable in guest mode before Firebase is configured.

## 1. Create a Firebase project

1. Open https://console.firebase.google.com/.
2. Select **Add project** and name it `GameZone`.
3. After it is created, open **Project overview** and add a **Web app**.
4. Register the app as `GameZone Web`.
5. Copy the Firebase web configuration object.\n\nThe project ID shown in the existing GameZone Firebase Console is `gamezone-5389b`. The repository config already has this project ID and its default Firebase auth domain prefilled. You still need to copy the exact `apiKey` and `appId` from the registered web app.

## 2. Add the web configuration

1. Open this repository's `assets/firebase-config.js` file on GitHub.
2. Replace the four placeholder values in `firebaseConfig`: `apiKey`, `authDomain`, `projectId`, and `appId`.
3. Save the file.

Only use the normal Firebase **web app config** shown for your web app. Never paste a service-account JSON file, private key, Admin SDK credential, or user's password into this public repository. The web config is meant for browser apps; Firestore security rules still protect user data.

## 3. Enable sign-in methods

1. In Firebase Console, open **Authentication**.
2. Select **Get started** if shown.
3. Open **Sign-in method**.
4. Enable **Email/Password** and save.
5. Enable **Google**, choose a support email, and save.

## 4. Authorize the GameZone domain

In **Authentication → Settings → Authorized domains**, add:

`parmarhiten153-netizen.github.io`

## 5. Create Firestore and publish security rules

1. Open **Firestore Database** in Firebase Console.
2. Select **Create database**.
3. Choose a region and start in production mode.
4. Open the **Rules** tab.
5. Copy the contents of this repository's `firestore.rules` file into the Rules editor.
6. Publish the rules.

These rules let a signed-in player read and write only the document at `users/{their-own-uid}`.

## 6. Test it

1. Wait for GitHub Pages to publish the latest commit.
2. Open [GameZone](https://parmarhiten153-netizen.github.io/gamezone/).
3. Add a game to Favorites and play a game once.
4. Open **Login / Profile**, create an account, and confirm the profile page reports that cloud sync is connected.
5. Sign in on another browser/device with the same account. Favorites, recent games, and supported best scores should sync after the profile loads.

## What the current cloud sync supports

- Email/password sign-up and login.
- Google sign-in.
- Per-user profile document at `users/{uid}`.
- Favorites and recently played games.
- Best scores for the original GameZone games **Neon Racer 3D** and **Bike Rush 3D**.
- Best driven distance for **Real Drive 3D**, saved in kilometres with two decimal places.
- **Level Devil** completed-level flags and death count.
- **Ludo** full board snapshot: current player, dice value/rolled state, all 16 token positions, and each player's finished-token count. Ludo autosaves after rolls and moves, with manual **Save Game** and **Resume Saved** controls.
- Ludo saves are stored in the signed-in player's `users/{uid}` document under `gameSaves.ludo`. The existing owner-only rule for `users/{uid}` also protects this field; no public database rule is needed.
- Local guest saves are kept separately from per-account saves on the same browser, so one account's saved board is not shown to another account.
- Local data is merged with cloud data on first sign-in for the profile features listed above. Game-specific saves use their own save/load adapter.

## What does not sync yet

Candy Match's best score syncs, but its active board and current move state do not. Ludo cloud saving requires the Firebase web config, Authentication, and Firestore rules above to be configured. A game's own save/load code must explicitly read and write its progress through the account system. Third-party games on another website cannot automatically share their private save data with GameZone.

## Safety notes

- Never commit Firebase service-account JSON, private keys, or Admin SDK credentials.
- Keep the owner-only Firestore rules published.
- Do not collect or store passwords yourself. Firebase Authentication handles passwords.
