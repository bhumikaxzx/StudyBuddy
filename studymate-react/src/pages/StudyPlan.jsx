import { useState } from "react";
import { FaCalendarAlt, FaMagic, FaCheckCircle } from "react-icons/fa";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { addHistory, loadBucket, saveBucket } from "../utils/storage";
import { callAI } from "../services/ai";

export default function StudyPlan() {
  const { user } = useAuth();
  const saved = loadBucket("studyPlan", user.id, null);
  const [goal, setGoal] = useState(saved?.goal || "Prepare for my upcoming exam");
  const [days, setDays] = useState(saved?.days || 7);
  const [minutes, setMinutes] = useState(saved?.minutes || 90);
  const [plan, setPlan] = useState(saved?.plan || []);
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setBusy(true); const r = await callAI("study-plan", { goal, days: Number(days), minutes: Number(minutes) }); const next = r.plan || []; setPlan(next); saveBucket("studyPlan", user.id, { goal, days: Number(days), minutes: Number(minutes), plan: next, createdAt: new Date().toISOString() }); addHistory(user.id, "plan", `Created a ${days}-day study plan`); setBusy(false);
  };

  return (
    <AppShell title="AI Study Plan" subtitle="Turn a goal into a simple daily schedule you can actually follow.">
      <div className="study-plan-layout">
        <section className="dashboard-card"><div className="card-header"><h2><FaMagic /> Plan settings</h2></div><div className="card-content">
          <div className="form-group"><label>What are you studying for?</label><textarea rows="4" value={goal} onChange={(e) => setGoal(e.target.value)} /></div>
          <div className="settings-grid"><div className="form-group"><label>Days</label><input type="number" min="1" max="30" value={days} onChange={(e) => setDays(e.target.value)} /></div><div className="form-group"><label>Minutes per day</label><input type="number" min="20" max="480" value={minutes} onChange={(e) => setMinutes(e.target.value)} /></div></div>
          <button className="btn primary" onClick={generate} disabled={busy}><FaCalendarAlt /> {busy ? "Planning..." : "Generate Study Plan"}</button>
        </div></section>
        <section className="dashboard-card"><div className="card-header"><h2>Your plan</h2></div><div className="card-content">{plan.length ? <div className="plan-timeline">{plan.map((d) => <div className="plan-day" key={d.day}><div className="plan-day-number">{d.day}</div><div><h3>{d.focus || `Day ${d.day}`}</h3><ul>{(d.tasks || []).map((t, i) => <li key={i}><FaCheckCircle /> {t}</li>)}</ul></div></div>)}</div> : <div className="summary-placeholder"><FaCalendarAlt /><h3>No plan yet</h3><p>Set your goal and create a realistic schedule.</p></div>}</div></section>
      </div>
    </AppShell>
  );
}
