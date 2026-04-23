import { AppState, ChatFolder } from "./types";

const STORAGE_KEY = "studypal_state_v1";

export function getInitialState(): AppState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // merge with defaults to handle new fields
      return deepMerge(defaultState(), parsed);
    }
  } catch {}
  return defaultState();
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function deepMerge(defaults: any, override: any): any {
  const result = { ...defaults };
  for (const key in override) {
    if (override[key] && typeof override[key] === "object" && !Array.isArray(override[key])) {
      result[key] = deepMerge(defaults[key] || {}, override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

export function defaultState(): AppState {
  return {
    user: { name: "", role: "" },
    ai: { name: "StudyPal", avatar: "🦉" },
    chatFolders: [
      {
        id: "default",
        name: "Umum",
        subject: "Umum",
        messages: [],
        createdAt: new Date().toISOString(),
      },
    ],
    studyTasks: [],
    weeklyTasks: [],
    mindMaps: [],
    flashcardDecks: [],
    settings: {
      theme: "light",
      accentColor: "#6C63FF",
      backgroundImage: undefined,
      fontSize: "medium",
      language: "id",
    },
  };
}

export function getCurrentWeek(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
}
