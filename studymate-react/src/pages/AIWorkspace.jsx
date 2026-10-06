import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  FaRobot, FaPaperPlane, FaLightbulb, FaLayerGroup, FaQuestionCircle, FaBook,
  FaMagic, FaFileAlt, FaCheckCircle, FaExclamationTriangle, FaServer,
} from "react-icons/fa";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { addHistory, loadBucket, saveBucket, uid } from "../utils/storage";
import { callAI, getAIStatus } from "../services/ai";

function SourceList({ sources = [] }) {
  if (!sources.length) return null;
  return (
    <details className="answer-sources">
      <summary>View retrieved source chunks ({sources.length})</summary>
      <div className="source-list">
        {sources.map((s) => <div key={s.id}><strong>[{s.id}]</strong> {s.excerpt}</div>)}
      </div>
    </details>
  );
}

export default function AIWorkspace() {
  const { user } = useAuth();
  const notes = loadBucket("notes", user.id, []);
  const [params] = useSearchParams();
  const [noteId, setNoteId] = useState(params.get("note") || notes[0]?.id || "");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([{ role: "assistant", text: "Choose a note and ask me something about it. With the AI server enabled, I will retrieve relevant sections and reason over them." }]);
  const [summary, setSummary] = useState([]);
  const [summaryOverview, setSummaryOverview] = useState("");
  const [ats, setAts] = useState(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ ok: false, aiConfigured: false, provider: "local", model: "extractive-fallback" });
  const selected = useMemo(() => notes.find((n) => n.id === noteId), [notes, noteId]);

  useEffect(() => { getAIStatus().then(setStatus); }, []);
  useEffect(() => { setSummary([]); setSummaryOverview(""); setAts(null); }, [noteId]);

  const appendAssistant = (result, fallback) => {
    setMessages((m) => [...m, {
      role: "assistant",
      text: result.answer || fallback,
      sources: result.sources || [],
      mode: result._meta?.mode,
    }]);
    if (result._meta?.mode === "model") setStatus((s) => ({ ...s, ok: true, aiConfigured: true, model: result._meta.model || s.model }));
  };

  const ask = async () => {
    if (!selected || !question.trim()) return;
    const q = question.trim();
    setQuestion("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    const result = await callAI("qa", { question: q, text: selected.text, title: selected.title });
    appendAssistant(result, "I could not answer from this material.");
    addHistory(user.id, "ai", `Asked AI about “${selected.title}”`);
    setBusy(false);
  };

  const summarize = async () => {
    if (!selected) return;
    setBusy(true);
    const r = await callAI("summarize", { text: selected.text, title: selected.title });
    setSummary(r.points || []);
    setSummaryOverview(r.overview || "");
    addHistory(user.id, "ai", `Summarized “${selected.title}”`);
    setBusy(false);
  };

  const explainKeyConcepts = async () => {
    if (!selected) return;
    setBusy(true);
    const request = "Explain the most important concepts in this material in simple language, then give one concrete example.";
    setMessages((m) => [...m, { role: "user", text: "Explain the key concepts simply." }]);
    const r = await callAI("explain", { concept: request, question: request, text: selected.text, title: selected.title });
    appendAssistant(r, "I could not explain the material.");
    addHistory(user.id, "ai", `Explained key concepts from “${selected.title}”`);
    setBusy(false);
  };

  const analyzeResume = async () => {
    if (!selected) return;
    setBusy(true);
    const r = await callAI("resume-ats", { text: selected.text, title: selected.title });
    setAts(r);
    addHistory(user.id, "ai", `Ran ATS analysis on “${selected.title}”`);
    setBusy(false);
  };

  const makeCards = async () => {
    if (!selected) return;
    setBusy(true);
    const r = await callAI("flashcards", { text: selected.text, count: 10, title: selected.title });
    const sets = loadBucket("flashcardSets", user.id, []);
    sets.unshift({ id: uid("set"), title: `${selected.title} - AI Cards`, cards: r.cards || [], createdAt: new Date().toISOString() });
    saveBucket("flashcardSets", user.id, sets);
    addHistory(user.id, "flashcards", `Generated flashcards from “${selected.title}”`);
    setBusy(false);
    alert(`Flashcards created${r._meta?.mode === "local" ? " in Local mode" : " with AI"}. Open the Flashcards page to study them.`);
  };

  const makeQuiz = async () => {
    if (!selected) return;
    setBusy(true);
    const r = await callAI("quiz", { text: selected.text, count: 7, title: selected.title });
    saveBucket("draftQuiz", user.id, { title: selected.title, questions: r.questions || [] });
    addHistory(user.id, "quiz", `Generated a quiz from “${selected.title}”`);
    setBusy(false);
    window.location.href = "/quiz";
  };

  const modelOnline = Boolean(status.aiConfigured);

  return (
    <AppShell title="AI Study Workspace" subtitle="Real model-backed Q&A, document summaries, ATS review, flashcards and quizzes.">
      {!notes.length ? <div className="dashboard-card"><div className="card-content center-card"><FaBook className="giant-icon" /><h2>Add study material first</h2><p>Upload a PDF or paste notes, then come back here for grounded Q&A.</p><Link className="btn primary" to="/notes">Go to Notes</Link></div></div> : <>
        <div className={`ai-mode-banner ${modelOnline ? "online" : "local"}`}>
          <span className="ai-mode-icon">{modelOnline ? <FaCheckCircle /> : <FaExclamationTriangle />}</span>
          <div>
            <strong>{modelOnline ? "Real AI backend connected" : "Local fallback mode"}</strong>
            <small>{modelOnline ? `${status.provider === "gemini" ? "Google Gemini" : status.provider} · ${status.model}` : "Start the server and add GEMINI_API_KEY for reasoning, ATS analysis and better generation."}</small>
          </div>
          <FaServer className="server-icon" />
        </div>

        <div className="ai-workspace-toolbar">
          <div className="form-group compact-field"><label>Study material</label><select value={noteId} onChange={(e) => setNoteId(e.target.value)}>{notes.map((n) => <option key={n.id} value={n.id}>{n.title}</option>)}</select></div>
          <button className="btn secondary" onClick={summarize} disabled={busy}><FaLightbulb /> Summarize</button>
          <button className="btn secondary" onClick={explainKeyConcepts} disabled={busy}><FaMagic /> Explain Simply</button>
          <button className="btn secondary" onClick={analyzeResume} disabled={busy}><FaFileAlt /> ATS Check</button>
          <button className="btn secondary" onClick={makeCards} disabled={busy}><FaLayerGroup /> Flashcards</button>
          <button className="btn secondary" onClick={makeQuiz} disabled={busy}><FaQuestionCircle /> Quiz</button>
        </div>

        <div className="ai-workspace-grid">
          <section className="dashboard-card ai-chat-card">
            <div className="card-header"><h2><FaRobot /> Ask about {selected?.title}</h2></div>
            <div className="card-content ai-chat-body">
              <div className="chat-thread">
                {messages.map((m, i) => <div key={i} className={`message-stack ${m.role}`}><div className={`bubble ${m.role}`}>{m.text}{m.mode === "local" && <span className="local-answer-label">Local fallback</span>}</div><SourceList sources={m.sources} /></div>)}
                {busy && <div className="bubble assistant">Thinking...</div>}
              </div>
              <div className="chat-composer"><textarea rows="3" value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }} placeholder="Ask a question, comparison, explanation, or document-specific analysis..." /><button onClick={ask} disabled={busy || !question.trim()}><FaPaperPlane /></button></div>
            </div>
          </section>

          <section className="dashboard-card summary-side-card">
            <div className="card-header"><h2>Quick summary</h2></div>
            <div className="card-content">{summary.length ? <><p className="summary-overview">{summaryOverview}</p><ul className="summary-bullets">{summary.map((p, i) => <li key={i}>{p}</li>)}</ul></> : <div className="summary-placeholder"><FaLightbulb /><h3>No summary yet</h3><p>Click Summarize for a document-wide model summary.</p></div>}</div>
          </section>
        </div>

        {ats && <section className="dashboard-card ats-panel">
          <div className="card-header"><h2><FaFileAlt /> ATS Resume Analysis</h2><span className="ats-score">{ats.score ?? "—"}/100</span></div>
          <div className="card-content">
            <p className="ats-verdict">{ats.verdict}</p>
            <div className="ats-grid">
              <div><h3>Strengths</h3><ul>{(ats.strengths || []).map((x, i) => <li key={i}>{x}</li>)}</ul></div>
              <div><h3>Issues to fix</h3><ul>{(ats.issues || []).map((x, i) => <li key={i}>{x}</li>)}</ul></div>
              <div><h3>Keywords</h3><div className="keyword-chips">{(ats.keywords || []).map((x, i) => <span key={i}>{x}</span>)}</div></div>
              <div><h3>Section advice</h3>{(ats.sectionAdvice || []).map((x, i) => <p key={i}><strong>{x.section}:</strong> {x.advice}</p>)}</div>
            </div>
            {ats.rewrittenSummary && <div className="rewritten-summary"><h3>Suggested summary</h3><p>{ats.rewrittenSummary}</p></div>}
            {ats._meta?.mode === "local" && <p className="local-warning">This is only a structural local check. Enable the AI backend for real ATS reasoning.</p>}
          </div>
        </section>}

        <div className="rag-note"><strong>RAG flow:</strong> the backend chunks the selected document, retrieves the most relevant sections, sends only grounded context to the model, and returns source excerpts with answers.</div>
      </>}
    </AppShell>
  );
}
