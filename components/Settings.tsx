"use client";
import { useState, useRef } from "react";
import { AppState } from "@/lib/types";

interface Props {
  state: AppState;
  setState: (s: (prev: AppState) => AppState) => void;
}

const ACCENT_COLORS = ["#6C63FF", "#EC4899", "#14B8A6", "#F59E0B", "#EF4444", "#22C55E", "#3B82F6", "#8B5CF6", "#F97316"];
const AI_AVATARS = ["🦉", "🤖", "🐬", "🦊", "🐼", "🦋", "⭐", "🚀", "🎓", "📚"];

export default function Settings({ state, setState }: Props) {
  const [worksheetTopic, setWorksheetTopic] = useState("");
  const [worksheetCount, setWorksheetCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [wsStatus, setWsStatus] = useState("");
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

  const generateWorksheet = async () => {
    if (!worksheetTopic.trim()) return;
    setGenerating(true);
    setWsStatus("Generating worksheet...");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "worksheet",
          topic: worksheetTopic,
          userRole: state.user.role,
          userName: state.user.name,
          options: { questionCount: worksheetCount },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWsStatus("Membuat PDF...");
        await generatePDF(data.data, state.user.name, state.ai.name);
        setWsStatus("✅ Worksheet berhasil diunduh!");
        setTimeout(() => setWsStatus(""), 3000);
      } else {
        setWsStatus("❌ Gagal generate. Coba lagi.");
      }
    } catch {
      setWsStatus("❌ Error. Coba lagi.");
    }
    setGenerating(false);
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

      {/* Worksheet Generator */}
      <div className="settings-section">
        <div className="settings-section-title">📄 Generate Worksheet PDF</div>
        <div className="card">
          <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 14 }}>
            Buat lembar kerja latihan soal yang bisa diunduh sebagai PDF, lengkap dengan kunci jawaban.
          </p>
          <div style={{ display: "grid", gap: 10 }}>
            <input
              className="input"
              placeholder="Topik soal (mis: Persamaan Linear Dua Variabel)"
              value={worksheetTopic}
              onChange={e => setWorksheetTopic(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select className="input" style={{ maxWidth: 180 }} value={worksheetCount} onChange={e => setWorksheetCount(Number(e.target.value))}>
                <option value={5}>5 soal</option>
                <option value={10}>10 soal</option>
                <option value={15}>15 soal</option>
                <option value={20}>20 soal</option>
              </select>
              <button className="btn btn-primary" onClick={generateWorksheet} disabled={generating || !worksheetTopic.trim()}>
                {generating ? "⏳ Generating..." : "📄 Generate & Download PDF"}
              </button>
            </div>
            {wsStatus && <div style={{ fontSize: 13, color: wsStatus.startsWith("✅") ? "var(--success)" : wsStatus.startsWith("❌") ? "var(--danger)" : "var(--text2)" }}>{wsStatus}</div>}
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

async function generatePDF(worksheet: any, userName: string, aiName: string) {
  const mcQuestions = worksheet.sections?.find((s: any) => s.type === "pilihan_ganda");
  const essayQuestions = worksheet.sections?.find((s: any) => s.type === "essay");

  const safeTitle = (worksheet.title || "worksheet").replace(/[^a-zA-Z0-9 ]/g, "").trim();

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>${worksheet.title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    color: #111;
    padding: 30px 40px;
    background: #fff;
  }
  .header {
    text-align: center;
    border-bottom: 2px solid #333;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }
  .header h1 { font-size: 16pt; font-weight: 900; margin-bottom: 4px; }
  .header p { font-size: 11pt; }
  .meta-row {
    display: flex;
    justify-content: space-between;
    margin: 16px 0;
    font-size: 11pt;
    gap: 12px;
  }
  .meta-field { flex: 1; }
  .meta-field span {
    display: block;
    border-bottom: 1px solid #888;
    min-height: 20px;
    margin-top: 2px;
  }
  .instructions {
    font-style: italic;
    color: #555;
    margin-bottom: 18px;
    font-size: 11pt;
    border-left: 3px solid #888;
    padding-left: 10px;
  }
  .section-title {
    font-size: 13pt;
    font-weight: 700;
    margin: 24px 0 12px;
    text-transform: uppercase;
  }
  .question { margin-bottom: 18px; page-break-inside: avoid; }
  .question-text { font-weight: 600; margin-bottom: 6px; }
  .options { margin-left: 20px; }
  .option { margin-bottom: 4px; }
  .answer-box {
    border: 1px dashed #ccc;
    min-height: 80px;
    margin-top: 6px;
    border-radius: 4px;
  }
  .answer-key {
    margin-top: 40px;
    border-top: 2px dashed #888;
    padding-top: 16px;
    page-break-before: always;
  }
  .answer-key-title {
    font-size: 14pt;
    font-weight: 900;
    text-align: center;
    margin-bottom: 16px;
  }
  .answer-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;
    font-size: 11pt;
  }
  .answer-label { font-weight: 700; margin: 14px 0 6px; }
  .generated-by {
    text-align: center;
    font-size: 9pt;
    color: #888;
    margin-top: 30px;
  }
  @media print {
    body { padding: 20px 30px; }
    .answer-key { page-break-before: always; }
  }
</style>
</head>
<body>

<div class="header">
  <h1>${worksheet.title}</h1>
  <p>Dibuat oleh ${aiName} · ${worksheet.date}</p>
</div>

<div class="meta-row">
  <div class="meta-field">Nama:<span>${userName || ""}</span></div>
  <div class="meta-field">Kelas:<span></span></div>
  <div class="meta-field">Tanggal:<span>${worksheet.date}</span></div>
</div>

<p class="instructions">📌 ${worksheet.instructions}</p>

${mcQuestions ? `
<div class="section-title">A. ${mcQuestions.title}</div>
${mcQuestions.questions.map((q: any) => `
<div class="question">
  <div class="question-text">${q.no}. ${q.question}</div>
  <div class="options">
    ${q.options.map((opt: string) => `<div class="option">${opt}</div>`).join("")}
  </div>
</div>`).join("")}` : ""}

${essayQuestions ? `
<div class="section-title">B. ${essayQuestions.title}</div>
${essayQuestions.questions.map((q: any) => `
<div class="question">
  <div class="question-text">${q.no}. (${q.points} poin) ${q.question}</div>
  <div class="answer-box"></div>
</div>`).join("")}` : ""}

<div class="answer-key">
  <div class="answer-key-title">🔑 KUNCI JAWABAN</div>
  ${mcQuestions ? `
  <div class="answer-label">Pilihan Ganda:</div>
  <div class="answer-grid">
    ${mcQuestions.questions.map((q: any) => `<div>${q.no}. ${q.answer}</div>`).join("")}
  </div>` : ""}
  ${essayQuestions ? `
  <div class="answer-label">Essay:</div>
  ${essayQuestions.questions.map((q: any) => `<p style="margin-bottom:6px;">${q.no}. ${q.answer}</p>`).join("")}` : ""}
</div>

<div class="generated-by">Worksheet ini di-generate oleh ${aiName} · StudyPal Platform</div>

<script>
  // Tunggu render selesai lalu langsung print (Save as PDF)
  window.addEventListener("load", function() {
    setTimeout(function() { window.print(); }, 300);
  });
</script>
</body>
</html>`;

  // Buat Blob dari HTML lalu buka di tab baru — cara ini work di Vercel
  // karena tidak butuh library eksternal sama sekali
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Bersihkan URL object setelah tab terbuka
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
