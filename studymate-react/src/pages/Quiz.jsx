import { useMemo, useState } from "react";
import { FaQuestionCircle, FaPlay, FaCheckCircle, FaRedo } from "react-icons/fa";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { addHistory, loadBucket, saveBucket, uid } from "../utils/storage";
import { callAI } from "../services/ai";

export default function Quiz() {
  const { user } = useAuth();
  const notes = loadBucket("notes", user.id, []);
  const draft = loadBucket("draftQuiz", user.id, null);
  const [source, setSource] = useState(draft?.questions?.length ? "" : "");
  const [noteId, setNoteId] = useState(notes[0]?.id || "");
  const [quiz, setQuiz] = useState(draft?.questions || []);
  const [title, setTitle] = useState(draft?.title || "Practice Quiz");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const selectedNote = useMemo(() => notes.find((n) => n.id === noteId), [notes, noteId]);

  const generate = async () => {
    const text = source.trim() || selectedNote?.text || "";
    if (!text) return; setBusy(true); const r = await callAI("quiz", { text, count: 7 }); setQuiz(r.questions || []); setTitle(selectedNote?.title || "Custom Quiz"); setAnswers({}); setCurrent(0); setDone(false); saveBucket("draftQuiz", user.id, null); setBusy(false);
  };

  const finish = () => {
    const correct = quiz.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);
    const score = quiz.length ? Math.round((correct / quiz.length) * 100) : 0;
    const history = loadBucket("quizHistory", user.id, []); history.unshift({ id: uid("quiz"), title, score, correct, total: quiz.length, completedAt: new Date().toISOString() }); saveBucket("quizHistory", user.id, history); addHistory(user.id, "quiz", `Completed “${title}” with ${score}%`, { score }); setDone(true);
  };

  const score = done && quiz.length ? Math.round((quiz.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0) / quiz.length) * 100) : 0;
  const q = quiz[current];

  return (
    <AppShell title="AI Quiz Generator" subtitle="Turn notes into practice questions, test yourself and track scores.">
      {!quiz.length ? <section className="quiz-card dashboard-card"><div className="card-header"><h2>Create a new quiz</h2></div><div className="card-content quiz-source">
        {notes.length > 0 && <div className="form-group"><label>Use a saved note</label><select value={noteId} onChange={(e) => setNoteId(e.target.value)}>{notes.map((n) => <option key={n.id} value={n.id}>{n.title}</option>)}</select></div>}
        <div className="divider-text"><span>or paste study material</span></div>
        <textarea className="big-textarea" rows="8" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Paste notes here..." />
        <button className="btn primary" onClick={generate} disabled={busy || (!source.trim() && !selectedNote)}><FaPlay /> {busy ? "Generating..." : "Generate Quiz"}</button>
      </div></section> : done ? <section className="quiz-results dashboard-card"><div className="card-content result-center"><FaCheckCircle className="result-icon" /><h2>Quiz completed!</h2><div className="score-circle"><span>{score}%</span></div><p>You answered {quiz.reduce((n, item, i) => n + (answers[i] === item.answer ? 1 : 0), 0)} of {quiz.length} correctly.</p><div className="result-actions"><button className="btn primary" onClick={() => { setQuiz([]); setDone(false); setAnswers({}); }}><FaRedo /> Create Another</button></div><div className="answer-review">{quiz.map((item, i) => <div className={`review-row ${answers[i] === item.answer ? "correct" : "wrong"}`} key={item.id}><strong>{i + 1}. {item.question}</strong><span>Your answer: {answers[i] || "Not answered"}</span><span>Correct: {item.answer}</span><small>{item.explanation}</small></div>)}</div></div></section> : <section className="quiz-card dashboard-card">
        <div className="card-header"><h2>{title}</h2><span>{current + 1} / {quiz.length}</span></div>
        <div className="card-content"><div className="quiz-progress"><div className="progress-bar"><div className="progress-fill" style={{ width: `${((current + 1) / quiz.length) * 100}%` }} /></div></div><div className="question-card"><h3>{q.question}</h3><div className="options-list">{q.choices.map((choice) => <button key={choice} className={`quiz-option ${answers[current] === choice ? "selected" : ""}`} onClick={() => setAnswers({ ...answers, [current]: choice })}>{choice}</button>)}</div></div><div className="quiz-nav"><button className="btn secondary" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>Previous</button>{current < quiz.length - 1 ? <button className="btn primary" disabled={!answers[current]} onClick={() => setCurrent((c) => c + 1)}>Next</button> : <button className="btn primary" disabled={!answers[current]} onClick={finish}>Finish Quiz</button>}</div></div>
      </section>}
      <section className="dashboard-card quiz-history-card"><div className="card-header"><h2>Quiz history</h2></div><div className="card-content"><div className="history-grid">{loadBucket("quizHistory", user.id, []).slice(0, 6).map((h) => <div className="history-item" key={h.id}><div className="history-header"><h3>{h.title}</h3><span className="history-date">{new Date(h.completedAt).toLocaleDateString()}</span></div><div className="history-stats"><span>Score <strong>{h.score}%</strong></span><span>{h.correct}/{h.total} correct</span></div></div>)}{!loadBucket("quizHistory", user.id, []).length && <p className="muted">No quiz attempts yet.</p>}</div></div></section>
    </AppShell>
  );
}
