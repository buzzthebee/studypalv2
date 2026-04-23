export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatFolder {
  id: string;
  name: string;
  subject: string;
  messages: Message[];
  createdAt: string;
}

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  notes?: string;
}

export interface WeeklyTask {
  id: string;
  title: string;
  day: string;
  subject: string;
  duration: number; // minutes
  completed: boolean;
  week: string; // YYYY-WW format
}

export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  children: MindMapNode[];
  color?: string;
}

export interface MindMap {
  id: string;
  title: string;
  subject: string;
  rootNode: MindMapNode;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
  reviewCount: number;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  cards: Flashcard[];
  createdAt: string;
}

export interface UserSettings {
  theme: "light" | "dark" | "auto";
  accentColor: string;
  backgroundImage?: string;
  fontSize: "small" | "medium" | "large";
  language: "id" | "en";
}

export interface AppState {
  user: {
    name: string;
    role: string; // detected by AI
  };
  ai: {
    name: string;
    avatar: string; // emoji or path
  };
  chatFolders: ChatFolder[];
  studyTasks: StudyTask[];
  weeklyTasks: WeeklyTask[];
  mindMaps: MindMap[];
  flashcardDecks: FlashcardDeck[];
  settings: UserSettings;
}
