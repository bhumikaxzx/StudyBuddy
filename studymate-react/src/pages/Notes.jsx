import { useMemo, useRef, useState } from "react";
import { FaFilePdf, FaFileAlt, FaTrash, FaUpload, FaRobot, FaSearch } from "react-icons/fa";
import AppShell from "../components/AppShell";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { addHistory, loadBucket, saveBucket, uid } from "../utils/storage";
import { extractTextFromFile } from "../services/pdf";

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState(() => loadBucket("notes", user.id, []));
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef(null);

  const persist = (next) => { setNotes(next); saveBucket("notes", user.id, next); };
  const addText = () => {
    if (!text.trim()) return setMessage("Paste some study material first.");
    const note = { id: uid("note"), title: title.trim() || "Untitled note", type: "text", text: text.trim(), createdAt: new Date().toISOString() };
    persist([note, ...notes]); addHistory(user.id, "note", `Created note “${note.title}”`); setTitle(""); setText(""); setMessage("Note saved.");
  };

  const onFile = async (file) => {
    if (!file) return; setBusy(true); setMessage("");
    try {
      const extracted = await extractTextFromFile(file);
      const note = { id: uid("note"), title: file.name.replace(/\.[^.]+$/, ""), filename: file.name, type: file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "text", text: extracted, createdAt: new Date().toISOString() };
      persist([note, ...notes]); addHistory(user.id, "note", `Uploaded “${file.name}”`); setMessage(`Imported ${file.name}.`);
    } catch (e) { setMessage(e.message); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const filtered = useMemo(() => notes.filter((n) => `${n.title} ${n.text}`.toLowerCase().includes(search.toLowerCase())), [notes, search]);

  return (
    <AppShell title="My Notes" subtitle="Upload study material or paste your own notes. PDF text becomes available to AI Q&A.">
      <section className="upload-section">
        <div className="upload-card">
          <div className="upload-header"><FaUpload /><h2>Add study material</h2></div>
          <div className="notes-input-grid">
            <div className="upload-area clickable-upload" onClick={() => fileRef.current?.click()}>
              <FaFilePdf /><h3>{busy ? "Reading file..." : "Upload PDF / TXT / Markdown"}</h3><p>StudyBuddy extracts text so you can summarize, quiz and ask questions.</p><button className="btn secondary" type="button">Choose file</button>
              <input ref={fileRef} hidden type="file" accept=".pdf,.txt,.md,text/plain,application/pdf" onChange={(e) => onFile(e.target.files?.[0])} />
            </div>
            <div className="text-form note-compose">
              <div className="form-group"><label>Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Operating Systems - Deadlocks" /></div>
              <div className="form-group"><label>Paste notes</label><textarea rows="8" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste lecture notes, textbook content or revision material..." /></div>
              <button className="btn primary" type="button" onClick={addText}>Save Note</button>
            </div>
          </div>
          {message && <div className="form-alert info">{message}</div>}
        </div>
      </section>

      <section>
        <div className="section-header"><h2>Study library</h2><div className="search-box"><FaSearch /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes" /></div></div>
        {filtered.length ? <div className="notes-grid">{filtered.map((note) => <div className="note-card" key={note.id}>
          <div className="note-header"><div className={`note-type ${note.type === "pdf" ? "pdf" : "text"}`}>{note.type === "pdf" ? <FaFilePdf /> : <FaFileAlt />}</div><div className="note-actions"><button className="action-btn" title="Delete" onClick={() => persist(notes.filter((n) => n.id !== note.id))}><FaTrash /></button></div></div>
          <div className="note-content"><h3>{note.title}</h3><p>{note.text.slice(0, 210)}{note.text.length > 210 ? "…" : ""}</p><div className="note-tags"><span className="tag">{note.type.toUpperCase()}</span><span className="tag">{new Date(note.createdAt).toLocaleDateString()}</span></div></div>
          <a className="inline-ai-link" href={`/ai?note=${note.id}`}><FaRobot /> Study with AI</a>
        </div>)}</div> : <EmptyState icon={<FaFileAlt />} title="No notes yet" text="Upload a PDF or save pasted study material to build your library." />}
      </section>
    </AppShell>
  );
}
