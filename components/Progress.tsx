"use client";
import { AppState } from "@/lib/types";
import { getCurrentWeek } from "@/lib/storage";

interface Props {
  state: AppState;
  setState: (s: (prev: AppState) => AppState) => void;
}

export default function Progress({ state, setState }: Props) {
  const currentWeek = getCurrentWeek();
  const weeklyTasks = state.weeklyTasks.filter(t => t.week === currentWeek);
  const completedWeekly = weeklyTasks.filter(t => t.completed).length;
  const totalMinutes = weeklyTasks.filter(t => t.completed).reduce((s, t) => s + t.duration, 0);
  const totalTasks = state.studyTasks.length;
  const completedTasks = state.studyTasks.filter(t => t.completed).length;
  const totalCards = state.flashcardDecks.reduce((s, d) => s + d.cards.length, 0);
  const masteredCards = state.flashcardDecks.reduce((s, d) => s + d.cards.filter(c => c.mastered).length, 0);
  const totalMindMaps = state.mindMaps.length;
  const totalMessages = state.chatFolders.reduce((s, f) => s + f.messages.filter(m => m.role === "user").length, 0);

  const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  return (
    <div className="panel">
      <div className="panel-header">
        <h1 className="panel-title">📊 Progress Belajar</h1>
        <p className="panel-sub">Pantau perkembangan belajarmu secara menyeluruh</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard number={completedTasks} total={totalTasks} label="Tugas Selesai" icon="✅" color="var(--success)" />
        <StatCard number={masteredCards} total={totalCards} label="Kartu Hafal" icon="🃏" color="var(--accent)" />
        <StatCard number={totalMindMaps} label="Mind Maps Dibuat" icon="🗺️" color="#F59E0B" />
        <StatCard number={totalMessages} label="Pertanyaan ke AI" icon="💬" color="#14B8A6" />
        <StatCard number={Math.round(totalMinutes / 60 * 10) / 10} label="Jam Belajar Minggu Ini" icon="⏱️" color="#8B5CF6" suffix="jam" />
        <StatCard number={completedWeekly} total={weeklyTasks.length} label="Jadwal Mingguan" icon="📅" color="#EC4899" />
      </div>

      {/* Weekly Schedule Heatmap */}
      {weeklyTasks.length > 0 && (
        <div className="card mb-4">
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>📅 Aktivitas Minggu Ini</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {DAYS.map(day => {
              const dayTasks = weeklyTasks.filter(t => t.day === day);
              const done = dayTasks.filter(t => t.completed).length;
              const pct = dayTasks.length > 0 ? done / dayTasks.length : 0;
              return (
                <div key={day} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 4 }}>{day.slice(0, 3)}</div>
                  <div style={{
                    width: "100%",
                    paddingBottom: "100%",
                    borderRadius: 8,
                    background: pct === 0 ? "var(--surface2)" : pct === 1 ? "var(--success)" : "var(--accent)",
                    opacity: pct === 0 ? 0.5 : 0.7 + pct * 0.3,
                    position: "relative",
                    transition: "all 0.3s",
                  }}>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: pct > 0 ? "white" : "var(--text3)" }}>
                      {dayTasks.length > 0 ? `${done}/${dayTasks.length}` : "—"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 11, color: "var(--text2)" }}>
            <span>■ <span style={{ background: "var(--success)", borderRadius: 2, padding: "1px 4px", color: "white" }}>Selesai</span></span>
            <span>■ <span style={{ background: "var(--accent)", borderRadius: 2, padding: "1px 4px", color: "white" }}>Sebagian</span></span>
            <span>■ <span style={{ background: "var(--surface2)", borderRadius: 2, padding: "1px 4px" }}>Kosong</span></span>
          </div>
        </div>
      )}

      {/* Subject breakdown */}
      {state.studyTasks.length > 0 && (
        <div className="card mb-4">
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>📚 Per Mata Pelajaran</div>
          {getSubjectStats(state.studyTasks).map(({ subject, completed, total }) => (
            <div key={subject} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                <span style={{ fontWeight: 600 }}>{subject || "Umum"}</span>
                <span style={{ color: "var(--text2)" }}>{completed}/{total}</span>
              </div>
              <div className="progress-bar-wrap">
                <div className="progress-bar" style={{ width: `${(completed / total) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flashcard decks */}
      {state.flashcardDecks.length > 0 && (
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>🃏 Flashcard Decks</div>
          {state.flashcardDecks.map(deck => {
            const mastered = deck.cards.filter(c => c.mastered).length;
            const pct = deck.cards.length > 0 ? (mastered / deck.cards.length) * 100 : 0;
            return (
              <div key={deck.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{deck.title}</span>
                  <span style={{ fontSize: 12, color: pct === 100 ? "var(--success)" : "var(--text2)" }}>
                    {pct === 100 ? "🎉 " : ""}{Math.round(pct)}% hafal
                  </span>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar" style={{ width: `${pct}%`, background: pct === 100 ? "var(--success)" : "var(--accent)" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {state.studyTasks.length === 0 && state.flashcardDecks.length === 0 && state.weeklyTasks.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text3)" }}>
          <div style={{ fontSize: 48 }}>📊</div>
          <div style={{ fontSize: 14, marginTop: 12 }}>
            Belum ada data. Mulai dengan menambah tugas atau membuat flashcard!
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ number, total, label, icon, color, suffix }: {
  number: number; total?: number; label: string; icon: string; color: string; suffix?: string;
}) {
  return (
    <div className="stat-card">
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div className="stat-number" style={{ color }}>
        {number}{suffix ? ` ${suffix}` : ""}
        {total !== undefined && <span style={{ fontSize: 16, color: "var(--text3)" }}>/{total}</span>}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function getSubjectStats(tasks: { subject: string; completed: boolean }[]) {
  const map: Record<string, { completed: number; total: number }> = {};
  tasks.forEach(t => {
    const s = t.subject || "Umum";
    if (!map[s]) map[s] = { completed: 0, total: 0 };
    map[s].total++;
    if (t.completed) map[s].completed++;
  });
  return Object.entries(map).map(([subject, stats]) => ({ subject, ...stats }));
}
