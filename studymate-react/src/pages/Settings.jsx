import { useState } from "react";
import { FaCog, FaClock, FaBell, FaMoon, FaTrash, FaSave } from "react-icons/fa";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getSettings, saveBucket } from "../utils/storage";

export default function Settings() {
  const { user, logout } = useAuth(); const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState(() => getSettings(user.id));
  const save = () => { saveBucket("settings", user.id, settings); alert("Settings saved."); };
  const clearData = () => { if (!confirm("Clear all StudyBuddy study data for this account?")) return; Object.keys(localStorage).filter((k) => k.startsWith(`studybuddy:v2:${user.id}:`)).forEach((k) => localStorage.removeItem(k)); alert("Study data cleared."); window.location.reload(); };
  return (
    <AppShell title="Settings" subtitle="Tune StudyBuddy to match the way you like to learn.">
      <div className="settings-page-grid">
        <section className="dashboard-card"><div className="card-header"><h2><FaMoon /> Appearance</h2></div><div className="card-content"><div className="setting-row"><div><strong>Theme</strong><p>Switch between light and dark mode.</p></div><select value={theme} onChange={(e) => setTheme(e.target.value)}><option value="light">Light</option><option value="dark">Dark</option></select></div><div className="setting-row"><div><strong>Language</strong><p>Interface language preference.</p></div><select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })}><option>English</option><option>Hindi</option></select></div></div></section>
        <section className="dashboard-card"><div className="card-header"><h2><FaClock /> Pomodoro</h2></div><div className="card-content"><div className="settings-grid"><div className="form-group"><label>Focus minutes</label><input type="number" min="10" max="90" value={settings.focusMinutes} onChange={(e) => setSettings({ ...settings, focusMinutes: Number(e.target.value) })} /></div><div className="form-group"><label>Short break</label><input type="number" min="1" max="30" value={settings.shortBreakMinutes} onChange={(e) => setSettings({ ...settings, shortBreakMinutes: Number(e.target.value) })} /></div><div className="form-group"><label>Long break</label><input type="number" min="5" max="60" value={settings.longBreakMinutes} onChange={(e) => setSettings({ ...settings, longBreakMinutes: Number(e.target.value) })} /></div><div className="form-group"><label>Daily goal (minutes)</label><input type="number" min="20" max="600" value={settings.dailyGoalMinutes} onChange={(e) => setSettings({ ...settings, dailyGoalMinutes: Number(e.target.value) })} /></div></div></div></section>
        <section className="dashboard-card"><div className="card-header"><h2><FaBell /> Notifications</h2></div><div className="card-content"><label className="toggle-row"><span><strong>Study reminders</strong><small>Keep reminders enabled in your future notification integration.</small></span><input type="checkbox" checked={settings.studyReminders} onChange={(e) => setSettings({ ...settings, studyReminders: e.target.checked })} /></label><label className="toggle-row"><span><strong>Progress updates</strong><small>Show motivational progress updates.</small></span><input type="checkbox" checked={settings.progressUpdates} onChange={(e) => setSettings({ ...settings, progressUpdates: e.target.checked })} /></label></div></section>
        <section className="dashboard-card danger-card"><div className="card-header"><h2><FaCog /> Account & data</h2></div><div className="card-content"><p>Prototype mode stores your study data locally in this browser. Connect Firebase for cloud sync before production.</p><div className="danger-actions"><button className="btn secondary" onClick={logout}>Logout</button><button className="btn danger-btn" onClick={clearData}><FaTrash /> Clear Study Data</button></div></div></section>
      </div>
      <div className="sticky-save"><button className="btn primary" onClick={save}><FaSave /> Save Settings</button></div>
    </AppShell>
  );
}
