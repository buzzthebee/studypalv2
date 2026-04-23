"use client";
import { useState } from "react";
import { AppState } from "@/lib/types";

interface Props {
  state: AppState;
}

export default function Worksheet({ state }: Props) {
  const [worksheetTopic, setWorksheetTopic] = useState("");
  const [worksheetCount, setWorksheetCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [wsStatus, setWsStatus] = useState("");

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
        <h1 className="panel-title">📄 Worksheet Latihan Soal</h1>
        <p className="panel-sub">
          Generate lembar kerja latihan soal beserta kunci jawaban dalam format PDF
        </p>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Buat Worksheet Baru</div>
        <div className="card">
          <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 18 }}>
            Masukkan topik dan jumlah soal yang kamu inginkan. Worksheet akan otomatis di-download sebagai PDF lengkap dengan kunci jawaban.
          </p>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
                Topik Soal
              </label>
              <input
                className="input"
                placeholder="Contoh: Persamaan Linear Dua Variabel, Fotosintesis, Hukum Newton..."
                value={worksheetTopic}
                onChange={e => setWorksheetTopic(e.target.value)}
                onKeyDown={e => e.key === "Enter" && generateWorksheet()}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
                Jumlah Soal
              </label>
              <select
                className="input"
                style={{ maxWidth: 200 }}
                value={worksheetCount}
                onChange={e => setWorksheetCount(Number(e.target.value))}
              >
                <option value={5}>5 soal</option>
                <option value={10}>10 soal</option>
                <option value={15}>15 soal</option>
                <option value={20}>20 soal</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                className="btn btn-primary"
                onClick={generateWorksheet}
                disabled={generating || !worksheetTopic.trim()}
              >
                {generating ? "⏳ Generating..." : "📄 Generate & Download PDF"}
              </button>
              {wsStatus && (
                <span
                  style={{
                    fontSize: 13,
                    color: wsStatus.startsWith("✅")
                      ? "var(--success)"
                      : wsStatus.startsWith("❌")
                      ? "var(--danger)"
                      : "var(--text2)",
                  }}
                >
                  {wsStatus}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">💡 Tips Penggunaan</div>
        <div className="card">
          <ul style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.8, paddingLeft: 18 }}>
            <li>Gunakan topik yang spesifik untuk hasil yang lebih baik</li>
            <li>Worksheet terdiri dari soal pilihan ganda dan essay</li>
            <li>Kunci jawaban disertakan di halaman terpisah</li>
            <li>Cocok untuk latihan mandiri atau persiapan ujian</li>
          </ul>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">📚 Saran Topik Populer</div>
        <div className="card">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              "Persamaan Kuadrat",
              "Fotosintesis & Respirasi",
              "Hukum Newton",
              "Sistem Periodik Unsur",
              "Sejarah Kemerdekaan RI",
              "Teks Argumentatif",
              "Trigonometri Dasar",
              "Ekosistem & Lingkungan",
            ].map(topic => (
              <button
                key={topic}
                className="suggestion-chip"
                onClick={() => setWorksheetTopic(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
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
  window.addEventListener("load", function() {
    setTimeout(function() { window.print(); }, 300);
  });
</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
