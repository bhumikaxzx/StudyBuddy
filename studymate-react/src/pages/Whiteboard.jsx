import { useEffect, useRef, useState } from "react";
import { FaEraser, FaPaintBrush, FaSave, FaTrash, FaDownload } from "react-icons/fa";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { addHistory, loadBucket, saveBucket, uid } from "../utils/storage";

export default function Whiteboard() {
  const { user } = useAuth();
  const canvasRef = useRef(null); const drawing = useRef(false);
  const [color, setColor] = useState("#00bcd4"); const [size, setSize] = useState(4); const [eraser, setEraser] = useState(false);
  const [saved, setSaved] = useState(() => loadBucket("whiteboards", user.id, []));

  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas.getContext("2d"); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const point = (e) => { const rect = canvasRef.current.getBoundingClientRect(); const source = e.touches?.[0] || e; return { x: (source.clientX - rect.left) * (canvasRef.current.width / rect.width), y: (source.clientY - rect.top) * (canvasRef.current.height / rect.height) }; };
  const start = (e) => { drawing.current = true; const ctx = canvasRef.current.getContext("2d"); const p = point(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); e.preventDefault?.(); };
  const move = (e) => { if (!drawing.current) return; const ctx = canvasRef.current.getContext("2d"); const p = point(e); ctx.strokeStyle = eraser ? "#ffffff" : color; ctx.lineWidth = eraser ? size * 4 : size; ctx.lineTo(p.x, p.y); ctx.stroke(); e.preventDefault?.(); };
  const stop = () => { drawing.current = false; };
  const clear = () => { const c = canvasRef.current; const ctx = c.getContext("2d"); ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, c.width, c.height); };
  const save = () => { const item = { id: uid("board"), name: `Whiteboard ${new Date().toLocaleString()}`, image: canvasRef.current.toDataURL("image/jpeg", .55), createdAt: new Date().toISOString() }; const next = [item, ...saved].slice(0, 4); setSaved(next); saveBucket("whiteboards", user.id, next); addHistory(user.id, "whiteboard", "Saved a whiteboard"); };
  const download = () => { const a = document.createElement("a"); a.download = `studybuddy-whiteboard-${Date.now()}.png`; a.href = canvasRef.current.toDataURL("image/png"); a.click(); };

  return (
    <AppShell title="Digital Whiteboard" subtitle="Sketch diagrams, formulas and quick visual explanations.">
      <div className="whiteboard-container">
        <section className="dashboard-card"><div className="whiteboard-toolbar"><div className="tool-group"><button className={!eraser ? "active" : ""} onClick={() => setEraser(false)}><FaPaintBrush /> Draw</button><button className={eraser ? "active" : ""} onClick={() => setEraser(true)}><FaEraser /> Eraser</button></div><div className="tool-group colors"><input aria-label="Brush color" type="color" value={color} onChange={(e) => setColor(e.target.value)} /><input aria-label="Brush size" type="range" min="1" max="20" value={size} onChange={(e) => setSize(Number(e.target.value))} /></div><div className="tool-group"><button onClick={clear}><FaTrash /> Clear</button><button onClick={save}><FaSave /> Save</button><button onClick={download}><FaDownload /> Export</button></div></div><div className="canvas-wrap"><canvas ref={canvasRef} width="1200" height="700" onMouseDown={start} onMouseMove={move} onMouseUp={stop} onMouseLeave={stop} onTouchStart={start} onTouchMove={move} onTouchEnd={stop} /></div></section>
        {saved.length > 0 && <section><div className="section-header"><h2>Saved whiteboards</h2></div><div className="saved-board-grid">{saved.map((b) => <div className="saved-board" key={b.id}><img src={b.image} alt={b.name} /><div><strong>{b.name}</strong><button className="action-btn danger" onClick={() => { const next = saved.filter((x) => x.id !== b.id); setSaved(next); saveBucket("whiteboards", user.id, next); }}><FaTrash /></button></div></div>)}</div></section>}
      </div>
    </AppShell>
  );
}
