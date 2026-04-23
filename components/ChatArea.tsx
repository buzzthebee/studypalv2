"use client";
import { useEffect, useRef, useState } from "react";
import { AppState, ChatFolder } from "@/lib/types";

interface Props {
  folder: ChatFolder;
  state: AppState;
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onNavigate: (view: string) => void;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/```([\w]*)\n([\s\S]*?)```/g, '<pre><code class="lang-$1">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(?!<[hbuliop])(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '');
}

const SUGGESTIONS = [
  "Jelaskan fotosintesis dengan cara yang mudah dipahami",
  "Bantu aku bikin soal matematika kelas 10",
  "Apa perbedaan sel hewan dan sel tumbuhan?",
  "Bagaimana cara belajar yang efektif?",
  "Jelaskan hukum Newton secara lengkap",
  "Bantu aku memahami trigonometri",
];

const QUICK_ACTIONS = [
  { label: "📋 Rencana Belajar", view: "studyplan" },
  { label: "🗺️ Mind Map", view: "mindmap" },
  { label: "🃏 Flashcards", view: "flashcards" },
  { label: "📄 Worksheet PDF", view: "worksheet" },
];

export default function ChatArea({ folder, state, isLoading, onSendMessage, onNavigate }: Props) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [folder.messages, isLoading]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    onSendMessage(text);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const userInitial = state.user.name ? state.user.name[0].toUpperCase() : "K";

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div style={{ fontSize: 22 }}>{state.ai.avatar}</div>
        <div>
          <div className="chat-header-title">{state.ai.name}</div>
          <div className="chat-header-sub">
            {folder.name} · {folder.messages.length} pesan
          </div>
        </div>
      </div>

      <div className="messages-area">
        {folder.messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-emoji">{state.ai.avatar}</div>
            <h2 className="welcome-title">
              Halo{state.user.name ? `, ${state.user.name}` : ""}! 👋
            </h2>
            <p className="welcome-sub">
              Aku <strong>{state.ai.name}</strong>, teman belajarmu! Tanya apa saja seputar pelajaran, ilmu pengetahuan, atau cara belajar yang efektif.
            </p>
            <div className="suggestion-chips">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="suggestion-chip" onClick={() => onSendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          folder.messages.map(msg => (
            <div key={msg.id} className={`message ${msg.role}`}>
              <div className="msg-avatar">
                {msg.role === "assistant" ? state.ai.avatar : userInitial}
              </div>
              <div>
                {msg.role === "assistant" ? (
                  <div
                    className="msg-bubble md-content"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                ) : (
                  <div className="msg-bubble">{msg.content}</div>
                )}
                <div className="msg-time">
                  {new Date(msg.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="message assistant">
            <div className="msg-avatar">{state.ai.avatar}</div>
            <div className="msg-bubble">
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="quick-actions">
          {QUICK_ACTIONS.map((qa, i) => (
            <button key={i} className="quick-btn" onClick={() => onNavigate(qa.view)}>
              {qa.label}
            </button>
          ))}
        </div>
        <div className="input-row">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={`Tanya ${state.ai.name} tentang pelajaran...`}
            rows={1}
            disabled={isLoading}
          />
          <button className="send-btn" onClick={handleSend} disabled={isLoading || !input.trim()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div style={{ fontSize: 11, color: "var(--text3)", textAlign: "center", marginTop: 6 }}>
          Enter untuk kirim · Shift+Enter untuk baris baru
        </div>
      </div>
    </div>
  );
}
