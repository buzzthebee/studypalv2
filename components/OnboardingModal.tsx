"use client";
import { useState } from "react";

interface Props {
  onComplete: (name: string, aiName: string, aiAvatar: string) => void;
}

const AI_AVATARS = ["🦉", "🤖", "🐬", "🦊", "🐼", "🦋", "⭐", "🚀", "🎓", "📚"];

export default function OnboardingModal({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [aiName, setAiName] = useState("StudyPal");
  const [aiAvatar, setAiAvatar] = useState("🦉");

  return (
    <div className="modal-overlay">
      <div className="modal">
        {step === 1 && (
          <div>
            <div style={{ textAlign: "center", fontSize: 52, marginBottom: 16 }}>👋</div>
            <h2 className="modal-title">Halo! Selamat Datang</h2>
            <p className="modal-sub">
              Aku adalah AI Buddy belajarmu. Siap membantu dari pelajaran SD sampai tingkat universitas!
              <br />Siapa namamu?
            </p>
            <input
              className="input"
              style={{ marginBottom: 16 }}
              placeholder="Nama kamu..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && name.trim() && setStep(2)}
              autoFocus
            />
            <button
              className="btn btn-primary w-full"
              onClick={() => name.trim() && setStep(2)}
              disabled={!name.trim()}
              style={{ justifyContent: "center" }}
            >
              Lanjut →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ textAlign: "center", fontSize: 52, marginBottom: 16 }}>🤖</div>
            <h2 className="modal-title">Hei, {name}! 👋</h2>
            <p className="modal-sub">Berikan nama untuk AI Buddy-mu agar lebih personal!</p>
            <input
              className="input"
              style={{ marginBottom: 20 }}
              placeholder="Nama AI (mis: StudyPal, Sage, Aria...)"
              value={aiName}
              onChange={e => setAiName(e.target.value)}
            />
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Pilih avatar AI:</p>
            <div className="avatar-grid" style={{ marginBottom: 20 }}>
              {AI_AVATARS.map(av => (
                <div
                  key={av}
                  className={`avatar-option ${aiAvatar === av ? "selected" : ""}`}
                  onClick={() => setAiAvatar(av)}
                >
                  {av}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>← Kembali</button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => onComplete(name.trim(), aiName.trim() || "StudyPal", aiAvatar)}
                disabled={!aiName.trim()}
              >
                Mulai Belajar! 🚀
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
          {[1, 2].map(s => (
            <div
              key={s}
              style={{
                width: s === step ? 20 : 7,
                height: 7,
                borderRadius: 4,
                background: s === step ? "var(--accent)" : "var(--border)",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
