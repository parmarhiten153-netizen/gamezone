import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, firebaseConfigured } from "./firebase-config.js";

export { firebaseConfigured };
export let auth = null;
export let db = null;

const validIds = new Set(["neon-racer", "bike-rush", "candy-match", "ludo", "level-devil"]);
const scoreKeys = {
  neonRacer: "gz_neon_racer_best",
  bikeRush: "gz_bike_rush_best",
  levelDevilDone: "fd_done",
  levelDevilDeaths: "fd_deaths"
};
let activeUser = null;
let stopSnapshot = null;
let syncRunning = false;
let syncQueued = false;

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
function readScore(key) {
  const value = Number(localStorage.getItem(key) || 0);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}
function readObject(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}
function cleanLevelDevil(value) {
  const source = value && typeof value === "object" ? value : {};
  const completed = {};
  for (const [key, done] of Object.entries(source.completed || {})) {
    if (done === true) completed[key] = true;
  }
  return { completed, deaths: Math.max(0, Math.floor(Number(source.deaths) || 0)) };
}
function mergeLevelDevil(a, b) {
  const left = cleanLevelDevil(a);
  const right = cleanLevelDevil(b);
  return {
    completed: { ...left.completed, ...right.completed },
    deaths: Math.max(left.deaths, right.deaths)
  };
}
function cleanFavorites(value) {
  return [...new Set((Array.isArray(value) ? value : []).filter(id => validIds.has(id)))];
}
function cleanRecent(value) {
  const byId = new Map();
  for (const item of Array.isArray(value) ? value : []) {
    if (!item || !validIds.has(item.id)) continue;
    const at = Number(item.at) || 0;
    const old = byId.get(item.id);
    if (!old || at > old.at) byId.set(item.id, { id: item.id, at });
  }
  return [...byId.values()].sort((a, b) => b.at - a.at).slice(0, 12);
}
function cleanScores(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    neonRacer: Math.max(0, Math.floor(Number(source.neonRacer) || 0)),
    bikeRush: Math.max(0, Math.floor(Number(source.bikeRush) || 0))
  };
}
function localState() {
  return {
    favorites: cleanFavorites(readArray("gamezone_favorites")),
    recentGames: cleanRecent(readArray("gamezone_recent")),
    bestScores: {
      neonRacer: readScore(scoreKeys.neonRacer),
      bikeRush: readScore(scoreKeys.bikeRush)
    },
    levelDevil: {
      completed: readObject(scoreKeys.levelDevilDone),
      deaths: readScore(scoreKeys.levelDevilDeaths)
    }
  };
}
function mergeRecent(a, b) {
  return cleanRecent([...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])]);
}
function mergeScores(a, b) {
  const left = cleanScores(a);
  const right = cleanScores(b);
  return {
    neonRacer: Math.max(left.neonRacer, right.neonRacer),
    bikeRush: Math.max(left.bikeRush, right.bikeRush)
  };
}
function applyToDevice(data) {
  localStorage.setItem("gamezone_favorites", JSON.stringify(cleanFavorites(data.favorites)));
  localStorage.setItem("gamezone_recent", JSON.stringify(cleanRecent(data.recentGames)));
  const scores = cleanScores(data.bestScores);
  localStorage.setItem(scoreKeys.neonRacer, String(scores.neonRacer));
  localStorage.setItem(scoreKeys.bikeRush, String(scores.bikeRush));
  const levelDevil = cleanLevelDevil(data.levelDevil);
  localStorage.setItem(scoreKeys.levelDevilDone, JSON.stringify(levelDevil.completed));
  localStorage.setItem(scoreKeys.levelDevilDeaths, String(levelDevil.deaths));
  window.dispatchEvent(new CustomEvent("gamezone:cloud-updated"));
}
function notifyStatus(connected, message) {
  window.dispatchEvent(new CustomEvent("gamezone:cloud-status", {
    detail: { connected, message }
  }));
}
async function initialMerge(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const remote = snap.exists() ? snap.data() : {};
  const local = localState();
  const merged = {
    favorites: cleanFavorites([...(remote.favorites || []), ...local.favorites]),
    recentGames: mergeRecent(remote.recentGames, local.recentGames),
    bestScores: mergeScores(remote.bestScores, local.bestScores),
    levelDevil: mergeLevelDevil(remote.levelDevil, local.levelDevil)
  };
  await setDoc(ref, {
    displayName: user.displayName || remote.displayName || "",
    email: user.email || remote.email || "",
    ...merged,
    updatedAt: serverTimestamp()
  }, { merge: true });
  applyToDevice(merged);
}
async function syncDeviceChanges() {
  if (!activeUser || !db) return;
  if (syncRunning) {
    syncQueued = true;
    return;
  }
  syncRunning = true;
  try {
    do {
      syncQueued = false;
      const ref = doc(db, "users", activeUser.uid);
      const snap = await getDoc(ref);
      const remote = snap.exists() ? snap.data() : {};
      const local = localState();
      const hasLocalFavorites = localStorage.getItem("gamezone_favorites") !== null;
      const merged = {
        favorites: hasLocalFavorites ? local.favorites : cleanFavorites(remote.favorites),
        recentGames: mergeRecent(remote.recentGames, local.recentGames),
        bestScores: mergeScores(remote.bestScores, local.bestScores),
        levelDevil: mergeLevelDevil(remote.levelDevil, local.levelDevil)
      };
      await setDoc(ref, {
        displayName: activeUser.displayName || remote.displayName || "",
        email: activeUser.email || remote.email || "",
        ...merged,
        updatedAt: serverTimestamp()
      }, { merge: true });
      applyToDevice(merged);
    } while (syncQueued);
  } catch (error) {
    console.error("GameZone cloud sync failed:", error);
    notifyStatus(false, "Cloud sync failed: " + error.message);
  } finally {
    syncRunning = false;
  }
}

if (firebaseConfigured) {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  onAuthStateChanged(auth, async user => {
    activeUser = user;
    if (stopSnapshot) {
      stopSnapshot();
      stopSnapshot = null;
    }
    if (!user) {
      notifyStatus(false, "Signed out. This device keeps its local game data.");
      return;
    }
    try {
      await initialMerge(user);
      const ref = doc(db, "users", user.uid);
      stopSnapshot = onSnapshot(ref, snap => {
        if (snap.exists()) applyToDevice(snap.data());
      }, error => {
        console.error("GameZone profile listener failed:", error);
        notifyStatus(false, "Cloud profile listener failed: " + error.message);
      });
      notifyStatus(true, "Cloud profile and supported game scores are synced.");
    } catch (error) {
      console.error("GameZone initial cloud sync failed:", error);
      notifyStatus(false, "Could not sync cloud profile: " + error.message);
    }
  });

  window.addEventListener("gamezone:data-changed", syncDeviceChanges);
  window.addEventListener("storage", event => {
    if (["gamezone_favorites", "gamezone_recent", scoreKeys.neonRacer, scoreKeys.bikeRush, scoreKeys.levelDevilDone, scoreKeys.levelDevilDeaths].includes(event.key)) {
      syncDeviceChanges();
    }
  });
} else {
  console.info("GameZone cloud sync is waiting for Firebase web config in assets/firebase-config.js.");
  notifyStatus(false, "Firebase setup is pending. Local game data still works.");
}
