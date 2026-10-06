import { useEffect, useMemo, useRef, useState } from "react";
import { FaPlay, FaPause, FaRedo, FaClock, FaCoffee, FaCheckCircle } from "react-icons/fa";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { addHistory, getSettings, loadBucket, saveBucket, uid } from "../utils/storage";

export default function Timer() {
  const { user } = useAuth();
  const settings = getSettings(user.id);
  const [mode, setMode] = useState("focus");
  const durations = useMemo(() => ({ focus: settings.focusMinutes || 25, short: settings.shortBreakMinutes || 5, long: settings.longBreakMinutes || 15 }), [settings.focusMinutes, settings.shortBreakMinutes, settings.longBreakMinutes]);
  const [seconds, setSeconds] = useState(durations.focus * 60);
  const [running, setRunning] = useState(false);
  const startedAt = useRef(null);
  const sessions = loadBucket("sessions", user.id, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (seconds > 0) return;
    setRunning(false);
    if (mode === "focus") {
      const item = { id: uid("session"), minutes: durations.focus, completedAt: new Date().toISOString() };
      saveBucket("sessions", user.id, [item, ...loadBucket("sessions", user.id, [])]);
      addHistory(user.id, "focus", `Completed a ${durations.focus}-minute focus session`);
    }
  }, [seconds, mode, durations.focus, user.id]);

  const switchMode = (next) => { setMode(next); setRunning(false); setSeconds(durations[next] * 60); startedAt.current = null; };
  const reset = () => { setRunning(false); setSeconds(durations[mode] * 60); startedAt.current = null; };
  const toggle = () => { if (!running && !startedAt.current) startedAt.current = Date.now(); setRunning((v) => !v); };
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0"); const ss = String(Math.max(0, seconds % 60)).padStart(2, "0");
  const progress = 1 - seconds / (durations[mode] * 60);

  return (
    <AppShell title="Focus Timer" subtitle="Use focused work intervals and let StudyBuddy record completed sessions.">
      <div className="timer-container">
        <div className="timer-display-section">
          <div className="timer-card">
            <div className="timer-mode-tabs"><button className={mode === "focus" ? "active" : ""} onClick={() => switchMode("focus")}>Focus</button><button className={mode === "short" ? "active" : ""} onClick={() => switchMode("short")}>Short break</button><button className={mode === "long" ? "active" : ""} onClick={() => switchMode("long")}>Long break</button></div>
            <div className="timer-circle" style={{ background: `conic-gradient(var(--primary) ${progress * 360}deg, rgba(0,0,0,.08) 0deg)` }}><div className="timer-circle-inner"><div className="timer-mode">{mode === "focus" ? "Focus session" : "Recharge"}</div><div className="timer-display">{mm}:{ss}</div><small>{running ? "Stay with the task" : "Ready when you are"}</small></div></div>
            <div className="timer-controls"><button className="control-btn secondary-control" onClick={reset}><FaRedo /></button><button className="control-btn primary-control" onClick={toggle}>{running ? <FaPause /> : <FaPlay />}</button></div>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-card dashboard-card"><div className="card-header"><h2><FaClock /> Session settings</h2></div><div className="card-content"><p className="muted">Change Pomodoro durations from Settings.</p><div className="timer-setting-summary"><span>Focus <strong>{durations.focus}m</strong></span><span>Short break <strong>{durations.short}m</strong></span><span>Long break <strong>{durations.long}m</strong></span></div></div></div>
        </div>

        <div className="history-section"><div className="history-card dashboard-card"><div className="card-header"><h2>Recent focus sessions</h2></div><div className="card-content"><div className="session-list">{sessions.slice(0, 8).map((s) => <div className="session-row" key={s.id}><span className="session-icon"><FaCheckCircle /></span><div><strong>{s.minutes} min focus</strong><small>{new Date(s.completedAt).toLocaleString()}</small></div></div>)}{!sessions.length && <div className="summary-placeholder"><FaCoffee /><h3>No sessions yet</h3><p>Complete your first focus timer to start tracking.</p></div>}</div></div></div></div>
      </div>
    </AppShell>
  );
}
