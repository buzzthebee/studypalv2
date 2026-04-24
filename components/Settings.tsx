"use client";
import { useState, useRef } from "react";
import { AppState } from "@/lib/types";

interface Props {
  state: AppState;
  setState: (s: (prev: AppState) => AppState) => void;
}

const ACCENT_COLORS = ["#6C63FF", "#EC4899", "#14B8A6", "#F59E0B", "#EF4444", "#22C55E", "#3B82F6", "#8B5CF6", "#F97316"];
const AI_AVATARS = ["🦉", "🤖", "🐬", "🦊", "🐼", "🦋", "⭐", "🚀", "🎓", "📚"];

const ROLES = [
  { id: "siswa_sd",  emoji: "🎒", label: "SD",        sublabel: "Sekolah Dasar" },
  { id: "siswa_smp", emoji: "📚", label: "SMP",       sublabel: "Sekolah Menengah Pertama" },
  { id: "siswa_sma", emoji: "🎓", label: "SMA",       sublabel: "Sekolah Menengah Atas" },
  { id: "mahasiswa", emoji: "🏫", label: "Mahasiswa", sublabel: "Perguruan Tinggi" },
  { id: "pengajar",  emoji: "👩‍🏫", label: "Pengajar",  sublabel: "Guru / Dosen" },
];

export default function Settings({ state, setState }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<AppState["settings"]>) => {
    setState(p => ({ ...p, settings: { ...p.settings, ...patch } }));
    // Apply theme to document
    if (patch.theme) document.documentElement.setAttribute("data-theme", patch.theme);
    if (patch.accentColor) document.documentElement.style.setProperty("--accent", patch.accentColor);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update({ backgroundImage: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h1 className="panel-title">⚙️ Pengaturan</h1>
        <p className="panel-sub">Personalisasi pengalaman belajarmu</p>
      </div>

      {/* Profile */}
      <div className="settings-section">
        <div className="settings-section-title">Profil Pengguna</div>
        <div className="card settings-grid">
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Nama Kamu</label>
            <input
              className="input"
              value={state.user.name}
              onChange={e => setState(p => ({ ...p, user: { ...p.user, name: e.target.value } }))}
              placeholder="Masukkan namamu..."
            />
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 10 }}>Jenjang Pendidikan</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ROLES.map(r => (
                <button
                  key={r.id}
                  onClick={() => setState(p => ({ ...p, user: { ...p.user, role: r.id } }))}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 10,
                    border: `2px solid ${state.user.role === r.id ? "var(--accent)" : "var(--border)"}`,
                    background: state.user.role === r.id ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "var(--card-bg)",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: state.user.role === r.id ? 700 : 500,
                    color: state.user.role === r.id ? "var(--accent)" : "var(--text2)",
                    transition: "all 0.15s",
                  }}
                >
                  <span>{r.emoji}</span>
                  <div style={{ textAlign: "left" }}>
                    <div>{r.label}</div>
                    <div style={{ fontSize: 10, opacity: 0.7 }}>{r.sublabel}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Customization */}
      <div className="settings-section">
        <div className="settings-section-title">Kustomisasi AI Buddy</div>
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Nama AI</label>
            <input
              className="input"
              value={state.ai.name}
              onChange={e => setState(p => ({ ...p, ai: { ...p.ai, name: e.target.value } }))}
              placeholder="Nama AI kamu..."
              style={{ maxWidth: 240 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 10 }}>Pilih Avatar AI</label>
            <div className="avatar-grid">
              {AI_AVATARS.map(av => (
                <div
                  key={av}
                  className={`avatar-option ${state.ai.avatar === av ? "selected" : ""}`}
                  onClick={() => setState(p => ({ ...p, ai: { ...p.ai, avatar: av } }))}
                  title={av}
                >
                  {av}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="settings-section">
        <div className="settings-section-title">Tampilan</div>
        <div className="card settings-grid">
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>Tema Warna</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["light", "dark", "auto"] as const).map(t => (
                <button
                  key={t}
                  className={`btn ${state.settings.theme === t ? "btn-primary" : "btn-secondary"} btn-sm`}
                  onClick={() => update({ theme: t })}
                >
                  {t === "light" ? "☀️ Terang" : t === "dark" ? "🌙 Gelap" : "🔄 Otomatis"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 10 }}>Warna Aksen</label>
            <div className="color-picker-row">
              {ACCENT_COLORS.map(c => (
                <div
                  key={c}
                  className={`color-dot ${state.settings.accentColor === c ? "selected" : ""}`}
                  style={{ background: c }}
                  onClick={() => update({ accentColor: c })}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>Background</label>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
                🖼️ Upload Foto Background
              </button>
              {state.settings.backgroundImage && (
                <button className="btn btn-danger btn-sm" onClick={() => update({ backgroundImage: undefined })}>
                  ✕ Hapus Background
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleBgUpload} />
            {state.settings.backgroundImage && (
              <div style={{ marginTop: 8, width: 120, height: 70, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
                <img src={state.settings.backgroundImage} alt="bg preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>Ukuran Teks</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["small", "medium", "large"] as const).map(s => (
                <button
                  key={s}
                  className={`btn ${state.settings.fontSize === s ? "btn-primary" : "btn-secondary"} btn-sm`}
                  onClick={() => update({ fontSize: s })}
                >
                  {s === "small" ? "Kecil" : s === "medium" ? "Sedang" : "Besar"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="settings-section">
        <div className="settings-section-title">Data</div>
        <div className="card">
          <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 14 }}>Data tersimpan secara lokal di browser kamu.</p>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (confirm("Yakin ingin menghapus semua data? Tindakan ini tidak bisa dibatalkan.")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
          >
            🗑️ Reset Semua Data
          </button>
        </div>
      </div>
    </div>
  );
}
