"use client";
import { useState, useRef } from "react";
import { AppState, MindMap as MindMapType, MindMapNode } from "@/lib/types";

interface Props {
  state: AppState;
  setState: (s: (prev: AppState) => AppState) => void;
  onSendMessage: (t: string) => void;
}

export default function MindMap({ state, setState, onSendMessage }: Props) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "mindmap", topic, userRole: state.user.role }),
      });
      const data = await res.json();
      if (data.success) {
        const map: MindMapType = {
          id: Date.now().toString(),
          title: data.data.title,
          subject: topic,
          rootNode: data.data.rootNode,
          createdAt: new Date().toISOString(),
        };
        setState(p => ({ ...p, mindMaps: [...p.mindMaps, map] }));
        setSelected(map.id);
        setTopic("");
      }
    } catch {}
    setLoading(false);
  };

  const deleteMap = (id: string) => {
    setState(p => ({ ...p, mindMaps: p.mindMaps.filter(m => m.id !== id) }));
    if (selected === id) setSelected(null);
  };

  const activeMap = state.mindMaps.find(m => m.id === selected);

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Left panel */}
      <div style={{ width: 240, flexShrink: 0, borderRight: "1px solid var(--border)", background: "var(--surface)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 12px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontWeight: 800, fontFamily: "var(--font-head)", fontSize: 15, marginBottom: 12 }}>🗺️ Mind Maps</div>
          <input
            className="input"
            style={{ marginBottom: 8 }}
            placeholder="Topik mind map..."
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generate()}
          />
          <button className="btn btn-primary w-full" onClick={generate} disabled={loading || !topic.trim()}>
            {loading ? "⏳ Generating..." : "✨ Generate AI"}
          </button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "8px" }}>
          {state.mindMaps.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20, color: "var(--text3)", fontSize: 12 }}>
              Belum ada mind map. Generate dari topik pelajaran!
            </div>
          ) : (
            state.mindMaps.map(m => (
              <div
                key={m.id}
                onClick={() => setSelected(m.id)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: selected === m.id ? "var(--accent-light)" : "transparent",
                  color: selected === m.id ? "var(--accent)" : "var(--text)",
                  fontWeight: selected === m.id ? 700 : 400,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 2,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ flex: 1 }}>🗺️ {m.title}</span>
                <button
                  onClick={e => { e.stopPropagation(); deleteMap(m.id); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", fontSize: 12, padding: 2 }}
                >✕</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, overflow: "auto", background: "var(--bg)", position: "relative" }}>
        {activeMap ? (
          <MindMapCanvas map={activeMap} onAskAI={(label) => onSendMessage(`Jelaskan lebih lanjut tentang "${label}" dalam konteks ${activeMap.title}`)} />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 12, color: "var(--text3)" }}>
            <div style={{ fontSize: 60 }}>🗺️</div>
            <div style={{ fontSize: 14, textAlign: "center" }}>
              Pilih atau generate mind map<br />dari panel kiri
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MindMapCanvas({ map, onAskAI }: { map: MindMapType; onAskAI: (label: string) => void }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["root"]));

  const toggle = (id: string) => {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div style={{ padding: 40, minHeight: "100%", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 800, color: "var(--text)", marginBottom: 32, fontSize: 22 }}>
          {map.title}
        </h2>
        <TreeNode node={map.rootNode} expanded={expanded} toggle={toggle} onAskAI={onAskAI} depth={0} isRoot />
      </div>
    </div>
  );
}

function TreeNode({
  node, expanded, toggle, onAskAI, depth, isRoot
}: {
  node: MindMapNode;
  expanded: Set<string>;
  toggle: (id: string) => void;
  onAskAI: (label: string) => void;
  depth: number;
  isRoot?: boolean;
}) {
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const colors = ["#6C63FF", "#FF6584", "#43CBFF", "#6FCF97", "#F7B731", "#FF8C5A", "#A855F7", "#14B8A6"];
  const color = node.color || colors[depth % colors.length];

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      <div
        onClick={() => { toggle(node.id); }}
        onDoubleClick={() => onAskAI(node.label)}
        style={{
          padding: isRoot ? "14px 28px" : "9px 20px",
          borderRadius: 50,
          background: isRoot ? color : `${color}22`,
          color: isRoot ? "white" : color,
          border: `2px solid ${color}`,
          fontWeight: 700,
          fontSize: isRoot ? 16 : depth === 1 ? 14 : 12,
          cursor: "pointer",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
          boxShadow: isRoot ? `0 4px 20px ${color}40` : undefined,
          userSelect: "none",
        }}
        title={hasChildren ? (isExpanded ? "Klik untuk collapse · Double klik untuk tanya AI" : "Klik untuk expand") : "Double klik untuk tanya AI"}
      >
        {node.label}
        {hasChildren && <span style={{ marginLeft: 6, opacity: 0.7, fontSize: 10 }}>{isExpanded ? "▲" : "▼"}</span>}
      </div>

      {hasChildren && isExpanded && (
        <div style={{ position: "relative", marginTop: 0 }}>
          {/* connector line down */}
          <div style={{ width: 2, height: 20, background: `${color}60`, margin: "0 auto" }} />
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", position: "relative" }}>
            {/* horizontal line */}
            {node.children.length > 1 && (
              <div style={{
                position: "absolute",
                top: 0,
                left: "calc(50% - " + ((node.children.length - 1) * 80) + "px)",
                width: ((node.children.length - 1) * 160) + "px",
                height: 2,
                background: `${color}40`,
              }} />
            )}
            {node.children.map(child => (
              <div key={child.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 2, height: 20, background: `${color}40` }} />
                <TreeNode node={child} expanded={expanded} toggle={toggle} onAskAI={onAskAI} depth={depth + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
