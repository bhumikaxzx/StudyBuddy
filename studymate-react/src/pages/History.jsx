import { FaClock, FaStickyNote, FaQuestionCircle, FaCheckCircle, FaChartLine } from "react-icons/fa";
import AppShell from "../components/AppShell";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { loadBucket } from "../utils/storage";

export default function History() {
  const { user } = useAuth();
  const history = loadBucket("history", user.id, []);
  const notes = loadBucket("notes", user.id, []); const sessions = loadBucket("sessions", user.id, []); const quizzes = loadBucket("quizHistory", user.id, []);
  const minutes = sessions.reduce((a, s) => a + (s.minutes || 0), 0); const avg = quizzes.length ? Math.round(quizzes.reduce((a, q) => a + q.score, 0) / quizzes.length) : 0;
  return (
    <AppShell title="Study History" subtitle="A record of the work you put in, not just the plans you made.">
      <div className="stats-grid"><StatCard icon={<FaClock />} label="Total Study Time" value={`${Math.floor(minutes / 60)}h ${minutes % 60}m`} /><StatCard icon={<FaStickyNote />} label="Notes Created" value={notes.length} /><StatCard icon={<FaQuestionCircle />} label="Quizzes Completed" value={quizzes.length} /><StatCard icon={<FaChartLine />} label="Average Score" value={`${avg}%`} /></div>
      <section className="dashboard-card"><div className="card-header"><h2>Recent activity</h2></div><div className="card-content"><div className="activity-timeline">{history.length ? history.map((h) => <div className="timeline-item" key={h.id}><div className="timeline-dot"><FaCheckCircle /></div><div><strong>{h.description}</strong><span>{new Date(h.timestamp).toLocaleString()}</span></div></div>) : <div className="summary-placeholder"><FaChartLine /><h3>No activity yet</h3><p>Use StudyBuddy tools and your progress will appear here.</p></div>}</div></div></section>
    </AppShell>
  );
}
