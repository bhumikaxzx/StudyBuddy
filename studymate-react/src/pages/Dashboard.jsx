import { Link } from "react-router-dom";
import { FaBook, FaCheckCircle, FaChartLine, FaClock, FaRobot, FaLayerGroup, FaQuestionCircle, FaTasks, FaPaintBrush, FaCalendarAlt } from "react-icons/fa";
import AppShell from "../components/AppShell";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { loadBucket } from "../utils/storage";

export default function Dashboard() {
  const { user } = useAuth();
  const tasks = loadBucket("tasks", user.id, []);
  const sessions = loadBucket("sessions", user.id, []);
  const quizzes = loadBucket("quizHistory", user.id, []);
  const history = loadBucket("history", user.id, []).slice(0, 5);
  const completed = tasks.filter((t) => t.completed).length;
  const avgScore = quizzes.length ? Math.round(quizzes.reduce((a, q) => a + (q.score || 0), 0) / quizzes.length) : 0;
  const focusMinutes = sessions.reduce((a, s) => a + (s.minutes || 0), 0);

  const quick = [
    ["/notes", FaBook, "Add Notes"], ["/ai", FaRobot, "Ask AI"], ["/flashcards", FaLayerGroup, "Flashcards"],
    ["/quiz", FaQuestionCircle, "Take Quiz"], ["/todo", FaTasks, "Add Task"], ["/timer", FaClock, "Focus"],
    ["/whiteboard", FaPaintBrush, "Whiteboard"], ["/study-plan", FaCalendarAlt, "Study Plan"],
  ];

  return (
    <AppShell title={`Welcome back, ${user.name.split(" ")[0]}!`} subtitle="Here is your study progress and what to do next.">
      <div className="stats-grid">
        <StatCard icon={<FaBook />} label="Study Sessions" value={sessions.length} hint={sessions.length ? "Keep the streak going" : "Start your first focus session"} />
        <StatCard icon={<FaCheckCircle />} label="Tasks Completed" value={`${completed}/${tasks.length}`} hint={tasks.length ? `${Math.round((completed / tasks.length) * 100)}% complete` : "Add your first task"} />
        <StatCard icon={<FaChartLine />} label="Average Quiz Score" value={`${avgScore}%`} hint={quizzes.length ? `${quizzes.length} quiz attempts` : "Generate a quiz from notes"} />
        <StatCard icon={<FaClock />} label="Focus Time" value={`${Math.floor(focusMinutes / 60)}h ${focusMinutes % 60}m`} hint="Tracked with Pomodoro" />
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card progress-card">
          <div className="card-header"><h2>Study progress</h2><Link className="card-link" to="/history">View history</Link></div>
          <div className="card-content">
            <div className="progress-overview">
              <div className="big-progress-ring" style={{ "--progress": `${Math.min(100, completed * 10 + sessions.length * 5)}%` }}><span>{Math.min(100, completed * 10 + sessions.length * 5)}%</span></div>
              <div className="progress-copy"><h3>Build consistency, not cramming.</h3><p>Every finished task, focus session and quiz contributes to your learning history.</p><Link className="btn secondary" to="/study-plan">Create a study plan</Link></div>
            </div>
          </div>
        </section>

        <section className="dashboard-card actions-card">
          <div className="card-header"><h2>Quick actions</h2></div>
          <div className="card-content"><div className="actions-grid">{quick.map(([to, Icon, label]) => <Link to={to} className="action-item" key={to}><div className="action-icon"><Icon /></div><span>{label}</span></Link>)}</div></div>
        </section>

        <section className="dashboard-card activity-card">
          <div className="card-header"><h2>Recent activity</h2><Link className="card-link" to="/history">All activity</Link></div>
          <div className="card-content"><div className="activity-list">{history.length ? history.map((item) => <div className="activity-item" key={item.id}><div className={`activity-icon ${item.type === "quiz" ? "completed" : item.type === "note" ? "uploaded" : "generated"}`}><FaCheckCircle /></div><div className="activity-details"><p>{item.description}</p><span className="activity-time">{new Date(item.timestamp).toLocaleString()}</span></div></div>) : <p className="muted">Your activity will appear here as you use StudyBuddy.</p>}</div></div>
        </section>

        <section className="dashboard-card tasks-card">
          <div className="card-header"><h2>Upcoming tasks</h2><Link className="card-link" to="/todo">Manage tasks</Link></div>
          <div className="card-content"><div className="tasks-list">{tasks.filter((t) => !t.completed).slice(0, 4).map((task) => <div className="task-item" key={task.id}><div className="task-details"><p>{task.title}</p><span className="task-due">{task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : "No deadline"}</span></div><div className={`task-priority ${task.priority || "medium"}`} /></div>)}{!tasks.some((t) => !t.completed) && <p className="muted">No pending tasks. Nice work.</p>}</div></div>
        </section>
      </div>
    </AppShell>
  );
}
