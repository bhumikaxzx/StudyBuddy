const APP_PREFIX = "studybuddy:v2";

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(`${APP_PREFIX}:currentUser`) || "null");
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) localStorage.setItem(`${APP_PREFIX}:currentUser`, JSON.stringify(user));
  else localStorage.removeItem(`${APP_PREFIX}:currentUser`);
}

export function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem(`${APP_PREFIX}:accounts`) || "[]");
  } catch {
    return [];
  }
}

export function setAccounts(accounts) {
  localStorage.setItem(`${APP_PREFIX}:accounts`, JSON.stringify(accounts));
}

function userKey(bucket, userId) {
  return `${APP_PREFIX}:${userId || "guest"}:${bucket}`;
}

export function loadBucket(bucket, userId, fallback = []) {
  try {
    const raw = localStorage.getItem(userKey(bucket, userId));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveBucket(bucket, userId, value) {
  localStorage.setItem(userKey(bucket, userId), JSON.stringify(value));
  return value;
}

export function pushBucket(bucket, userId, item) {
  const items = loadBucket(bucket, userId, []);
  items.unshift(item);
  saveBucket(bucket, userId, items);
  return items;
}

export function uid(prefix = "item") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function addHistory(userId, type, description, meta = {}) {
  return pushBucket("history", userId, {
    id: uid("history"),
    type,
    description,
    meta,
    timestamp: new Date().toISOString(),
  });
}

export function getSettings(userId) {
  return loadBucket("settings", userId, {
    language: "English",
    fontSize: "medium",
    animations: true,
    studyReminders: true,
    progressUpdates: true,
    emailNotifications: false,
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    dailyGoalMinutes: 120,
  });
}

export function getProfile(user) {
  return loadBucket("profile", user?.id, {
    name: user?.name || "Student",
    email: user?.email || "",
    bio: "Learning a little better every day.",
    course: "Computer Science",
    goal: "Build consistent study habits",
    avatar: "",
  });
}
