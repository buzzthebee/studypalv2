"use client";
import { useState } from "react";
import { AppState, FlashcardDeck, Flashcard } from "@/lib/types";

interface Props {
  state: AppState;
  setState: (s: (prev: AppState) => AppState) => void;
  onSendMessage: (t: string) => void;
}

export default function Flashcards({ state, setState, onSendMessage }: Props) {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "flashcards", topic, userRole: state.user.role, options: { count } }),
      });
      const data = await res.json();
      if (data.success) {
        const deck: FlashcardDeck = {
          id: Date.now().toString(),
          title: data.data.title,
          subject: topic,
          cards: data.data.cards,
          createdAt: new Date().toISOString(),
        };
        setState(p => ({ ...p, flashcardDecks: [...p.flashcardDecks, deck] }));
        setSelectedDeck(deck.id);
        setCardIndex(0);
        setFlipped(false);
        setTopic("");
      }
    } catch {}
    setLoading(false);
  };

  const deck = state.flashcardDecks.find(d => d.id === selectedDeck);
  const reviewCards = reviewMode && deck ? deck.cards.filter(c => !c.mastered) : deck?.cards || [];
  const card = reviewCards[cardIndex];

  const nextCard = () => {
    setFlipped(false);
    setTimeout(() => setCardIndex(i => Math.min(i + 1, reviewCards.length - 1)), 100);
  };

  const prevCard = () => {
    setFlipped(false);
    setTimeout(() => setCardIndex(i => Math.max(i - 1, 0)), 100);
  };

  const toggleMastered = () => {
    if (!deck || !card) return;
    setState(p => ({
      ...p,
      flashcardDecks: p.flashcardDecks.map(d =>
        d.id === deck.id
          ? { ...d, cards: d.cards.map(c => c.id === card.id ? { ...c, mastered: !c.mastered, reviewCount: c.reviewCount + 1 } : c) }
          : d
      ),
    }));
    nextCard();
  };

  const masteredCount = deck?.cards.filter(c => c.mastered).length || 0;

  return (
    <div className="panel">
      <div className="panel-header flex justify-between items-center">
        <div>
          <h1 className="panel-title">🃏 Flashcards</h1>
          <p className="panel-sub">Belajar dengan kartu bolak-balik interaktif</p>
        </div>
      </div>

      {/* Generator */}
      <div className="card mb-4">
        <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>🤖 Generate Flashcard dengan AI</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input" placeholder="Topik (mis: Sistem Peredaran Darah)" value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && generate()} />
          <select className="input" style={{ width: 90 }} value={count} onChange={e => setCount(Number(e.target.value))}>
            {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} kartu</option>)}
          </select>
          <button className="btn btn-primary" onClick={generate} disabled={loading || !topic.trim()}>
            {loading ? "⏳" : "✨"}
          </button>
        </div>
      </div>

      {/* Deck list */}
      {state.flashcardDecks.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {state.flashcardDecks.map(d => (
            <button
              key={d.id}
              className={`btn ${selectedDeck === d.id ? "btn-primary" : "btn-secondary"} btn-sm`}
              onClick={() => { setSelectedDeck(d.id); setCardIndex(0); setFlipped(false); }}
            >
              🃏 {d.title} ({d.cards.length})
            </button>
          ))}
        </div>
      )}

      {/* Active deck */}
      {deck && reviewCards.length > 0 && (
        <div>
          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "var(--text2)" }}>
              Kartu {cardIndex + 1} dari {reviewCards.length}
              {reviewMode && <span style={{ marginLeft: 8, color: "var(--warning)" }}>• Mode Review (belum hafal)</span>}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--success)" }}>✓ {masteredCount}/{deck.cards.length} hafal</span>
              <button
                className={`btn btn-sm ${reviewMode ? "btn-primary" : "btn-secondary"}`}
                onClick={() => { setReviewMode(!reviewMode); setCardIndex(0); setFlipped(false); }}
              >
                {reviewMode ? "📚 Semua" : "📝 Review"}
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="progress-bar-wrap mb-4">
            <div className="progress-bar" style={{ width: `${((cardIndex + 1) / reviewCards.length) * 100}%`, background: "var(--accent)" }} />
          </div>

          {/* Card */}
          <div className={`flashcard-flip ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
            <div className="flashcard-inner">
              <div className="flashcard-face flashcard-front">
                <div>
                  <div className="flashcard-text">{card.front}</div>
                  <div className="flashcard-hint">Klik untuk lihat jawaban</div>
                </div>
              </div>
              <div className="flashcard-face flashcard-back">
                <div>
                  <div className="flashcard-text">{card.back}</div>
                  <div className="flashcard-hint">Klik untuk kembali</div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
            <button className="btn btn-secondary" onClick={prevCard} disabled={cardIndex === 0}>← Sebelumnya</button>
            <button
              className="btn"
              style={{ background: card.mastered ? "#DCFCE7" : "var(--surface2)", color: card.mastered ? "var(--success)" : "var(--text2)", border: "1px solid var(--border)" }}
              onClick={toggleMastered}
            >
              {card.mastered ? "✅ Sudah Hafal" : "⬜ Tandai Hafal"}
            </button>
            <button className="btn btn-secondary" onClick={nextCard} disabled={cardIndex === reviewCards.length - 1}>Selanjutnya →</button>
          </div>

          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onSendMessage(`Jelaskan lebih lanjut tentang: "${card.front}" - "${card.back}"`)}
            >
              🤖 Tanya AI tentang kartu ini
            </button>
          </div>
        </div>
      )}

      {deck && reviewCards.length === 0 && reviewMode && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48 }}>🎉</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 12 }}>Luar biasa!</div>
          <div style={{ color: "var(--text2)", marginTop: 8 }}>Kamu sudah hafal semua kartu dalam deck ini!</div>
          <button className="btn btn-primary mt-4" onClick={() => setReviewMode(false)}>Lihat Semua Kartu</button>
        </div>
      )}

      {!deck && state.flashcardDecks.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text3)" }}>
          <div style={{ fontSize: 48 }}>🃏</div>
          <div style={{ fontSize: 14, marginTop: 12 }}>Belum ada flashcard. Generate dari topik pelajaranmu!</div>
        </div>
      )}
    </div>
  );
}
