# GameZone Firebase setup

This guide activates real email/password and Google sign-in for the existing `login.html` page.

## 1. Create a Firebase project

1. Open https://console.firebase.google.com/
2. Choose **Add project** and name it `GameZone`.
3. After the project is ready, open **Project overview** and add a **Web app**.
4. Register it as `GameZone Web`.
5. Copy the `firebaseConfig` object shown by Firebase.

## 2. Add the web config

1. Open this repository's `login.html` file on GitHub.
2. Find `const firebaseConfig = {...}`.
3. Replace the four `YOUR_...` placeholder values with the matching values from your Firebase web app config.
4. Keep the property names exactly as Firebase provides them. The Firebase web config is designed to be used in client-side web apps; do not paste service-account private keys or Admin SDK credentials here.

The login page checks that all four values are filled before initializing Firebase.

## 3. Enable sign-in methods

1. In Firebase Console, open **Authentication**.
2. Choose **Get started** if prompted.
3. Open **Sign-in method**.
4. Enable **Email/Password** and save.
5. Enable **Google**, choose a support email, and save.

## 4. Authorize the GameZone domain

In **Authentication → Settings → Authorized domains**, add:

`parmarhiten153-netizen.github.io`

The local preview domain is not needed for the public GitHub Pages site.

## 5. Create the Firestore database

1. Open **Firestore Database** in Firebase Console.
2. Choose **Create database**.
3. Select a region close to your expected users.
4. Start in production mode.
5. Open the **Rules** tab and use these owner-only rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, create, update, delete:
        if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

6. Publish the rules.

## What works after setup

- Email/password account creation and login.
- Google sign-in popup.
- A per-user Firestore document at `users/{uid}` for the profile.

## What is not connected yet

The current site stores favorites and recently played games in that browser's local storage. The profile page can display those local lists, but they are not yet synchronized to Firestore across devices. Cloud-synced favorites/history need the homepage to write changes to the signed-in user's document.

Individual game scores and levels can only sync when the game itself exposes a save/load mechanism. A third-party game opened on another website cannot automatically share its private progress with GameZone.

## Safety notes

- Never put Firebase service-account JSON, private keys, or Admin SDK credentials in this public repository.
- Keep Firestore rules restricted to the signed-in user's own UID as shown above.
- Do not collect or store users' passwords yourself. Firebase Authentication handles them.
