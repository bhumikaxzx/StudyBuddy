import { useMemo, useState } from "react";
import { FaLayerGroup, FaCheck, FaPlus, FaTrash, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import AppShell from "../components/AppShell";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { addHistory, loadBucket, saveBucket, uid } from "../utils/storage";
import { callAI } from "../services/ai";

export default function Flashcards() {
  const { user } = useAuth();
  const [sets, setSets] = useState(() => loadBucket("flashcardSets", user.id, []));
  const [selectedId, setSelectedId] = useState(sets[0]?.id || "");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = useMemo(() => sets.find((s) => s.id === selectedId), [sets, selectedId]);
  const card = selected?.cards?.[index];
  const persist = (next) => { setSets(next); saveBucket("flashcardSets", user.id, next); };

  const generate = async () => {
    if (!source.trim()) return; setBusy(true); const r = await callAI("flashcards", { text: source, count: 10 });
    const set = { id: uid("set"), title: `Flashcards ${new Date().toLocaleDateString()}`, cards: r.cards || [], createdAt: new Date().toISOString() };
    const next = [set, ...sets]; persist(next); setSelectedId(set.id); setIndex(0); setSource(""); addHistory(user.id, "flashcards", "Generated a new flashcard set"); setBusy(false);
  };

  const markMastered = () => {
    if (!selected || !card) return;
    const next = sets.map((s) => s.id === selected.id ? { ...s, cards: s.cards.map((c, i) => i === index ? { ...c, mastered: !c.mastered } : c) } : s);
    persist(next);
  };

  const nextCard = (direction) => { if (!selected?.cards?.length) return; setIndex((index + direction + selected.cards.length) % selected.cards.length); setFlipped(false); };

  return (
    <AppShell title="Smart Flashcards" subtitle="Generate active-recall cards from study material and track mastered concepts.">
      <div className="flashcards-container">
        <section className="dashboard-card generator-card">
          <div className="card-header"><h2><FaPlus /> Generate Flashcards</h2></div>
          <div className="card-content"><textarea className="big-textarea" rows="5" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Paste a topic or notes to generate flashcards..." /><button className="btn primary" onClick={generate} disabled={busy}>{busy ? "Generating..." : "Generate 10 Cards"}</button></div>
        </section>

        {selected && card ? <>
          <div className="flashcards-stats stats-grid mini-stats">
            <div className="stat-card"><div className="stat-info"><h3>Total Cards</h3><span className="stat-value">{selected.cards.length}</span></div></div>
            <div className="stat-card"><div className="stat-info"><h3>Mastered</h3><span className="stat-value">{selected.cards.filter((c) => c.mastered).length}</span></div></div>
            <div className="stat-card"><div className="stat-info"><h3>Progress</h3><span className="stat-value">{Math.round((selected.cards.filter((c) => c.mastered).length / selected.cards.length) * 100)}%</span></div></div>
          </div>
          <section className="dashboard-card study-card-panel">
            <div className="card-header"><h2>{selected.title}</h2><select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setIndex(0); setFlipped(false); }}>{sets.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select></div>
            <div className="card-content">
              <div className={`flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((v) => !v)}>
                <div className="card-inner"><div className="card-front"><span className="card-number">Card {index + 1} / {selected.cards.length}</span><h3>{card.front}</h3><small>Click to reveal answer</small></div><div className="card-back"><h3>Answer</h3><p>{card.back}</p></div></div>
              </div>
              <div className="flashcard-controls"><button onClick={() => nextCard(-1)}><FaArrowLeft /> Previous</button><button className={card.mastered ? "mastered" : ""} onClick={markMastered}><FaCheck /> {card.mastered ? "Mastered" : "Mark Mastered"}</button><button onClick={() => nextCard(1)}>Next <FaArrowRight /></button></div>
            </div>
          </section>
        </> : <EmptyState icon={<FaLayerGroup />} title="No flashcards yet" text="Paste study material above or generate cards from the AI Workspace." />}

        {sets.length > 0 && <section><div className="section-header"><h2>Your flashcard sets</h2></div><div className="notes-grid">{sets.map((s) => <div className="note-card" key={s.id}><div className="note-content"><h3>{s.title}</h3><p>{s.cards.length} cards · {s.cards.filter((c) => c.mastered).length} mastered</p></div><div className="set-actions"><button className="btn secondary" onClick={() => { setSelectedId(s.id); setIndex(0); }}>Study</button><button className="action-btn danger" onClick={() => { const next = sets.filter((x) => x.id !== s.id); persist(next); if (selectedId === s.id) setSelectedId(next[0]?.id || ""); }}><FaTrash /></button></div></div>)}</div></section>}
      </div>
    </AppShell>
  );
}
