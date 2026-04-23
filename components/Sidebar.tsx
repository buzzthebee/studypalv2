"use client";
import { useState } from "react";
import { AppState, ChatFolder } from "@/lib/types";

interface Props {
  state: AppState;
  setState: (s: (prev: AppState) => AppState) => void;
  activeView: string;
  setActiveView: (v: any) => void;
  activeChatId: string;
  setActiveChatId: (id: string) => void;
}

const NAV = [
  { id: "chat", icon: "💬", label: "Chat" },
  { id: "studyplan", icon: "📋", label: "Study Plan" },
  { id: "mindmap", icon: "🗺️", label: "Mind Map" },
  { id: "flashcards", icon: "🃏", label: "Flashcards" },
  { id: "worksheet", icon: "📄", label: "Worksheet" },
  { id: "progress", icon: "📊", label: "Progress" },
  { id: "settings", icon: "⚙️", label: "Pengaturan" },
];

export default function Sidebar({ state, setState, activeView, setActiveView, activeChatId, setActiveChatId }: Props) {
  const [showFolders, setShowFolders] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [addingFolder, setAddingFolder] = useState(false);

  const addFolder = () => {
    if (!newFolderName.trim()) return;
    const folder: ChatFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      subject: newFolderName.trim(),
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setState(p => ({ ...p, chatFolders: [...p.chatFolders, folder] }));
    setActiveChatId(folder.id);
    setActiveView("chat");
    setNewFolderName("");
    setAddingFolder(false);
  };

  const deleteFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (state.chatFolders.length <= 1) return;
    setState(p => ({ ...p, chatFolders: p.chatFolders.filter(f => f.id !== id) }));
    if (activeChatId === id) setActiveChatId(state.chatFolders[0].id);
  };

  const initial = state.user.name ? state.user.name[0].toUpperCase() : "?";

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="ai-profile" onClick={() => setActiveView("settings")}>
          <div className="ai-avatar">{state.ai.avatar}</div>
          <div>
            <div className="ai-name">{state.ai.name}</div>
            <div className="ai-status">● Online siap belajar</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu Utama</div>
        {NAV.filter(n => n.id !== "chat").map(n => (
          <button
            key={n.id}
            className={`nav-item ${activeView === n.id ? "active" : ""}`}
            onClick={() => setActiveView(n.id)}
          >
            <span className="icon">{n.icon}</span>
            {n.label}
          </button>
        ))}

        <div className="nav-section-label" style={{ marginTop: 12 }}>
          <span>Folder Chat</span>
        </div>

        <button className="nav-item" onClick={() => { setActiveView("chat"); setActiveChatId("default"); }}>
          <span className="icon">💬</span>
          <span style={{ flex: 1 }}>Semua Chat</span>
        </button>

        {state.chatFolders.map(f => (
          <button
            key={f.id}
            className={`chat-folder-item ${activeChatId === f.id && activeView === "chat" ? "active" : ""}`}
            onClick={() => { setActiveChatId(f.id); setActiveView("chat"); }}
          >
            <span>📁</span>
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
            {f.id !== "default" && (
              <span
                onClick={(e) => deleteFolder(f.id, e)}
                style={{ opacity: 0, fontSize: 12, color: "var(--text3)", transition: "opacity 0.15s" }}
                onMouseOver={e => (e.currentTarget.style.opacity = "1")}
                onMouseOut={e => (e.currentTarget.style.opacity = "0")}
              >✕</span>
            )}
          </button>
        ))}

        {addingFolder ? (
          <div style={{ padding: "4px 8px 4px 24px" }}>
            <input
              className="input"
              style={{ fontSize: 12, padding: "5px 10px" }}
              placeholder="Nama folder..."
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addFolder()}
              autoFocus
            />
            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={addFolder}>Buat</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setAddingFolder(false)}>Batal</button>
            </div>
          </div>
        ) : (
          <button className="nav-item" onClick={() => setAddingFolder(true)} style={{ fontSize: 12, color: "var(--text3)" }}>
            <span className="icon">＋</span>
            Tambah Folder
          </button>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{initial}</div>
          <div className="user-info">
            <div className="user-name">{state.user.name || "Pengguna"}</div>
            <div className="user-role">{roleLabel(state.user.role)}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    siswa_sd: "Siswa SD 🎒",
    siswa_smp: "Siswa SMP 📚",
    siswa_sma: "Siswa SMA 🎓",
    mahasiswa: "Mahasiswa 🎓",
    peneliti: "Peneliti 🔬",
    pengajar: "Pengajar 👩‍🏫",
    dosen: "Dosen 👨‍🎓",
    umum: "Pengguna Umum",
  };
  return map[role] || "Pelajar 📖";
}
