// Firebase web-app configuration for GameZone.
// These values are public client configuration, not service-account credentials.
// Replace the placeholders with the config from Firebase Console.
export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "gamezone-5389b.firebaseapp.com",
  projectId: "gamezone-5389b",
  appId: "YOUR_FIREBASE_APP_ID"
};

export const firebaseConfigured = Object.values(firebaseConfig).every(
  value => typeof value === "string" && value.length > 0 && !value.startsWith("YOUR_")
);
