"use client";
import { useState } from "react";
import { AppState, StudyTask, WeeklyTask } from "@/lib/types";
import { getCurrentWeek } from "@/lib/storage";

interface Props {
  state: AppState;
  setState: (s: (prev: AppState) => AppState) => void;
}

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function StudyPlan({ state, setState }: Props) {
  const [tab, setTab] = useState<"todo" | "weekly">("todo");
  const [showAdd, setShowAdd] = useState(false);
  const [showAddWeekly, setShowAddWeekly] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [form, setForm] = useState({ title: "", subject: "", dueDate: "", priority: "medium" as const, notes: "" });
  const [weeklyForm, setWeeklyForm] = useState({ title: "", day: "Senin", subject: "", duration: 60 });

  const currentWeek = getCurrentWeek();
  const weeklyTasks = state.weeklyTasks.filter(t => t.week === currentWeek);
  const completedTodos = state.studyTasks.filter(t => t.completed).length;
  const totalTodos = state.studyTasks.length;

  const toggleTask = (id: string) => {
    setState(p => ({
      ...p,
      studyTasks: p.studyTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t),
    }));
  };

  const toggleWeekly = (id: string) => {
    setState(p => ({
      ...p,
      weeklyTasks: p.weeklyTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t),
    }));
  };

  const addTask = () => {
    if (!form.title.trim()) return;
    const task: StudyTask = {
      id: Date.now().toString(),
      ...form,
      completed: false,
      dueDate: form.dueDate || new Date().toISOString().split("T")[0],
    };
    setState(p => ({ ...p, studyTasks: [...p.studyTasks, task] }));
    setForm({ title: "", subject: "", dueDate: "", priority: "medium", notes: "" });
    setShowAdd(false);
  };

  const addWeeklyTask = () => {
    if (!weeklyForm.title.trim()) return;
    const task: WeeklyTask = {
      id: Date.now().toString(),
      ...weeklyForm,
      completed: false,
      week: currentWeek,
    };
    setState(p => ({ ...p, weeklyTasks: [...p.weeklyTasks, task] }));
    setWeeklyForm({ title: "", day: "Senin", subject: "", duration: 60 });
    setShowAddWeekly(false);
  };

  const generateAIPlan = async () => {
    if (!aiTopic.trim()) return;
    setLoadingAI(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "studyplan", topic: aiTopic, userRole: state.user.role, userName: state.user.name, options: { weeks: 4 } }),
      });
      const data = await res.json();
      if (data.success && data.data.tasks) {
        setState(p => ({ ...p, studyTasks: [...p.studyTasks, ...data.data.tasks] }));
        setAiTopic("");
      }
    } catch {}
    setLoadingAI(false);
  };

  const deleteTask = (id: string) => {
    setState(p => ({ ...p, studyTasks: p.studyTasks.filter(t => t.id !== id) }));
  };

  const exportToGoogleCalendar = (task: StudyTask) => {
    const startDate = task.dueDate.replace(/-/g, "");
    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", task.title);
    url.searchParams.set("dates", `${startDate}/${startDate}`);
    url.searchParams.set("details", task.notes ? `${task.notes}\nMata pelajaran: ${task.subject}` : `Mata pelajaran: ${task.subject}`);
    window.open(url.toString(), "_blank");
  };

  const exportWeeklyToCalendar = (task: WeeklyTask) => {
    const dayMap: Record<string, number> = { Senin: 1, Selasa: 2, Rabu: 3, Kamis: 4, Jumat: 5, Sabtu: 6, Minggu: 0 };
    const today = new Date();
    const todayDay = today.getDay();
    const targetDay = dayMap[task.day];
    const diff = (targetDay - todayDay + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);

    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = `${targetDate.getFullYear()}${pad(targetDate.getMonth() + 1)}${pad(targetDate.getDate())}`;
    const startHour = 8;
    const endHour = startHour + Math.floor(task.duration / 60);
    const endMin = task.duration % 60;
    const startTime = `${dateStr}T${pad(startHour)}0000`;
    const endTime = `${dateStr}T${pad(endHour)}${pad(endMin)}00`;

    const dayAbbr: Record<string, string> = { Senin: "MO", Selasa: "TU", Rabu: "WE", Kamis: "TH", Jumat: "FR", Sabtu: "SA", Minggu: "SU" };
    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", `📚 ${task.title}`);
    url.searchParams.set("dates", `${startTime}/${endTime}`);
    url.searchParams.set("details", `Belajar: ${task.subject} | Durasi: ${task.duration} menit`);
    url.searchParams.set("recur", `RRULE:FREQ=WEEKLY;BYDAY=${dayAbbr[task.day]}`);
    window.open(url.toString(), "_blank");
  };

  return (
    <div className="panel">
      <div className="panel-header flex justify-between items-center">
        <div>
          <h1 className="panel-title">📋 Study Plan</h1>
          <p className="panel-sub">Atur jadwal dan tugasmu dengan terstruktur</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(true)}>＋ Tambah Tugas</button>
        </div>
      </div>

      {/* AI Generator */}
      <div className="card mb-4">
        <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>🤖 Generate Study Plan dengan AI</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            placeholder="Topik yang ingin dipelajari (mis: Fisika Gelombang)"
            value={aiTopic}
            onChange={e => setAiTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generateAIPlan()}
          />
          <button className="btn btn-primary" onClick={generateAIPlan} disabled={loadingAI || !aiTopic.trim()}>
            {loadingAI ? "⏳" : "✨ Generate"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {totalTodos > 0 && (
        <div className="card mb-4">
          <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Progress Todo</span>
            <span style={{ fontSize: 13, color: "var(--text2)" }}>{completedTodos}/{totalTodos} selesai</span>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar" style={{ width: `${(completedTodos / totalTodos) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {(["todo", "weekly"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`btn ${tab === t ? "btn-primary" : "btn-secondary"} btn-sm`}
          >
            {t === "todo" ? "📝 To-Do List" : "📅 Jadwal Mingguan"}
          </button>
        ))}
      </div>

      {tab === "todo" && (
        <div>
          {showAdd && (
            <div className="card mb-4" style={{ border: "1.5px solid var(--accent)" }}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>Tambah Tugas Baru</div>
              <div style={{ display: "grid", gap: 8 }}>
                <input className="input" placeholder="Judul tugas*" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <input className="input" placeholder="Mata pelajaran" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
                  <input type="date" className="input" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                  <select className="input" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as any }))}>
                    <option value="high">🔴 Tinggi</option>
                    <option value="medium">🟡 Sedang</option>
                    <option value="low">🟢 Rendah</option>
                  </select>
                </div>
                <input className="input" placeholder="Catatan (opsional)" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary" onClick={addTask}>Simpan</button>
                  <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Batal</button>
                </div>
              </div>
            </div>
          )}

          {state.studyTasks.length === 0 ? (
            <EmptyState icon="📋" text="Belum ada tugas. Tambah tugas baru atau generate dengan AI!" />
          ) : (
            [...state.studyTasks]
              .sort((a, b) => {
                const priority = { high: 0, medium: 1, low: 2 };
                if (a.completed !== b.completed) return a.completed ? 1 : -1;
                return priority[a.priority] - priority[b.priority];
              })
              .map(task => (
                <div key={task.id} className={`task-item ${task.completed ? "completed" : ""}`}>
                  <div className={`task-check ${task.completed ? "checked" : ""}`} onClick={() => toggleTask(task.id)}>
                    {task.completed && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                  </div>
                  <div className="task-info">
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      {task.subject && <span>📚 {task.subject}</span>}
                      {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString("id-ID")}</span>}
                      <span className={`priority-badge priority-${task.priority}`}>
                        {task.priority === "high" ? "Tinggi" : task.priority === "medium" ? "Sedang" : "Rendah"}
                      </span>
                    </div>
                    {task.notes && <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>{task.notes}</div>}
                  </div>
                  <button className="btn btn-secondary btn-icon" onClick={() => exportToGoogleCalendar(task)} title="Export ke Google Calendar">
                    📅
                  </button>
                  <button className="btn btn-danger btn-icon" onClick={() => deleteTask(task.id)} title="Hapus">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                  </button>
                </div>
              ))
          )}
        </div>
      )}

      {tab === "weekly" && (
        <div>
          {showAddWeekly && (
            <div className="card mb-4" style={{ border: "1.5px solid var(--accent)" }}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>Tambah Jadwal Mingguan</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input className="input" placeholder="Nama kegiatan*" value={weeklyForm.title} onChange={e => setWeeklyForm(p => ({ ...p, title: e.target.value }))} />
                <select className="input" value={weeklyForm.day} onChange={e => setWeeklyForm(p => ({ ...p, day: e.target.value }))}>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input className="input" placeholder="Mata pelajaran" value={weeklyForm.subject} onChange={e => setWeeklyForm(p => ({ ...p, subject: e.target.value }))} />
                <input type="number" className="input" placeholder="Durasi (menit)" value={weeklyForm.duration} onChange={e => setWeeklyForm(p => ({ ...p, duration: Number(e.target.value) }))} />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="btn btn-primary" onClick={addWeeklyTask}>Simpan</button>
                <button className="btn btn-secondary" onClick={() => setShowAddWeekly(false)}>Batal</button>
              </div>
            </div>
          )}
          {!showAddWeekly && (
            <button className="btn btn-secondary btn-sm mb-4" onClick={() => setShowAddWeekly(true)}>＋ Tambah Jadwal</button>
          )}

          {DAYS.map(day => {
            const dayTasks = weeklyTasks.filter(t => t.day === day);
            if (dayTasks.length === 0) return null;
            return (
              <div key={day} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)", marginBottom: 6 }}>{day}</div>
                {dayTasks.map(task => (
                  <div key={task.id} className={`task-item ${task.completed ? "completed" : ""}`}>
                    <div className={`task-check ${task.completed ? "checked" : ""}`} onClick={() => toggleWeekly(task.id)}>
                      {task.completed && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                    </div>
                    <div className="task-info">
                      <div className="task-title">{task.title}</div>
                      <div className="task-meta">
                        <span>📚 {task.subject}</span>
                        <span>⏱️ {task.duration} menit</span>
                      </div>
                    </div>
                    <button className="btn btn-secondary btn-icon" onClick={() => exportWeeklyToCalendar(task)} title="Tambah ke Google Calendar">
                      📅
                    </button>
                  </div>
                ))}
              </div>
            );
          })}

          {weeklyTasks.length === 0 && (
            <EmptyState icon="📅" text="Belum ada jadwal minggu ini. Tambah kegiatan belajarmu!" />
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text3)" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14 }}>{text}</div>
    </div>
  );
}
