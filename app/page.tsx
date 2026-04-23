"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import StudyPlan from "@/components/StudyPlan";
import MindMap from "@/components/MindMap";
import Flashcards from "@/components/Flashcards";
import Progress from "@/components/Progress";
import Settings from "@/components/Settings";
import Worksheet from "@/components/Worksheet";
import OnboardingModal from "@/components/OnboardingModal";
import { AppState, Message, ChatFolder, StudyTask, FlashcardDeck, WeeklyTask } from "@/lib/types";
import { getInitialState, saveState } from "@/lib/storage";

export default function Home() {
  const [state, setState] = useState<AppState | null>(null);
  const [activeView, setActiveView] = useState<"chat" | "studyplan" | "mindmap" | "flashcards" | "worksheet" | "progress" | "settings">("chat");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string>("default");

  useEffect(() => {
    const s = getInitialState();
    setState(s);
    if (!s.user.name) setShowOnboarding(true);
  }, []);

  useEffect(() => {
    if (state) saveState(state);
  }, [state]);

  const sendMessage = useCallback(async (text: string) => {
    if (!state || !text.trim()) return;
    const folder = state.chatFolders.find(f => f.id === activeChatId) || state.chatFolders[0];
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        chatFolders: prev.chatFolders.map(f =>
          f.id === activeChatId ? { ...f, messages: [...f.messages, userMsg] } : f
        ),
      };
    });

    setIsLoading(true);
    try {
      const history = folder.messages.slice(-20).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          userName: state.user.name,
          userRole: state.user.role,
          systemContext: `User name: ${state.user.name || "pengguna"}. Accumulated role context: ${state.user.role || "belum diketahui"}.`,
        }),
      });
      const data = await res.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "Maaf, terjadi kesalahan. Coba lagi ya!",
        timestamp: new Date().toISOString(),
      };
      setState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          chatFolders: prev.chatFolders.map(f =>
            f.id === activeChatId ? { ...f, messages: [...f.messages, aiMsg] } : f
          ),
          user: { ...prev.user, role: data.detectedRole || prev.user.role },
        };
      });
    } catch {
      setState(prev => {
        if (!prev) return prev;
        const errMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Ups! Ada gangguan koneksi. Coba kirim pesan lagi ya 😊",
          timestamp: new Date().toISOString(),
        };
        return {
          ...prev,
          chatFolders: prev.chatFolders.map(f =>
            f.id === activeChatId ? { ...f, messages: [...f.messages, errMsg] } : f
          ),
        };
      });
    } finally {
      setIsLoading(false);
    }
  }, [state, activeChatId]);

  if (!state) return <div className="loading-screen"><div className="loader" /></div>;

  const currentFolder = state.chatFolders.find(f => f.id === activeChatId) || state.chatFolders[0];

  return (
    <div
      className="app-root"
      style={{
        "--bg-image": state.settings.backgroundImage ? `url(${state.settings.backgroundImage})` : "none",
        "--accent": state.settings.accentColor || "#6C63FF",
      } as React.CSSProperties}
      data-theme={state.settings.theme}
    >
      {state.settings.backgroundImage && (
        <div className="bg-overlay" style={{ backgroundImage: `url(${state.settings.backgroundImage})` }} />
      )}
      <Sidebar
        state={state}
        setState={setState}
        activeView={activeView}
        setActiveView={setActiveView}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
      />
      <main className="main-content">
        {activeView === "chat" && (
          <ChatArea
            folder={currentFolder}
            state={state}
            isLoading={isLoading}
            onSendMessage={sendMessage}
            onNavigate={(view) => setActiveView(view as any)}
          />
        )}
        {activeView === "studyplan" && (
          <StudyPlan state={state} setState={setState} />
        )}
        {activeView === "mindmap" && (
          <MindMap state={state} setState={setState} onSendMessage={sendMessage} />
        )}
        {activeView === "flashcards" && (
          <Flashcards state={state} setState={setState} onSendMessage={sendMessage} />
        )}
        {activeView === "worksheet" && (
          <Worksheet state={state} />
        )}
        {activeView === "progress" && (
          <Progress state={state} setState={setState} />
        )}
        {activeView === "settings" && (
          <Settings state={state} setState={setState} />
        )}
      </main>
      {showOnboarding && (
        <OnboardingModal
          onComplete={(name, aiName, aiAvatar) => {
            setState(prev => prev ? {
              ...prev,
              user: { ...prev.user, name },
              ai: { name: aiName, avatar: aiAvatar },
            } : prev);
            setShowOnboarding(false);
          }}
        />
      )}
    </div>
  );
}
