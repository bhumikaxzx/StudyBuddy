import { useMemo, useState } from "react";
import { FaPlus, FaTrash, FaTasks, FaCheckCircle, FaCalendarAlt } from "react-icons/fa";
import AppShell from "../components/AppShell";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { addHistory, loadBucket, saveBucket, uid } from "../utils/storage";

export default function Todo() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(() => loadBucket("tasks", user.id, []));
  const [form, setForm] = useState({ title: "", dueDate: "", priority: "medium" });
  const persist = (next) => { setTasks(next); saveBucket("tasks", user.id, next); };
  const add = (e) => { e.preventDefault(); if (!form.title.trim()) return; const task = { id: uid("task"), ...form, title: form.title.trim(), completed: false, createdAt: new Date().toISOString() }; persist([task, ...tasks]); addHistory(user.id, "task", `Added task “${task.title}”`); setForm({ title: "", dueDate: "", priority: "medium" }); };
  const toggle = (id) => { const next = tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t); const changed = next.find((t) => t.id === id); persist(next); if (changed?.completed) addHistory(user.id, "task", `Completed task “${changed.title}”`); };
  const stats = useMemo(() => ({ total: tasks.length, completed: tasks.filter((t) => t.completed).length, pending: tasks.filter((t) => !t.completed).length, dueToday: tasks.filter((t) => !t.completed && t.dueDate === new Date().toISOString().slice(0, 10)).length }), [tasks]);

  return (
    <AppShell title="Study Task Manager" subtitle="Keep assignments, revision goals and deadlines in one focused list.">
      <div className="stats-grid mini-stats"><div className="stat-card"><div className="stat-info"><h3>Total Tasks</h3><span className="stat-value">{stats.total}</span></div></div><div className="stat-card"><div className="stat-info"><h3>Completed</h3><span className="stat-value">{stats.completed}</span></div></div><div className="stat-card"><div className="stat-info"><h3>Pending</h3><span className="stat-value">{stats.pending}</span></div></div><div className="stat-card"><div className="stat-info"><h3>Due Today</h3><span className="stat-value">{stats.dueToday}</span></div></div></div>
      <div className="todo-container">
        <section className="dashboard-card add-task-card"><div className="card-header"><h2><FaPlus /> Add New Task</h2></div><form className="card-content add-task-form" onSubmit={add}><div className="form-group grow"><label>Task</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Revise graph algorithms" /></div><div className="form-group"><label>Due date</label><input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div><div className="form-group"><label>Priority</label><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div><button className="btn primary"><FaPlus /> Add</button></form></section>
        <section className="dashboard-card"><div className="card-header"><h2>Your study tasks</h2><span>{stats.completed}/{stats.total} done</span></div><div className="card-content">{tasks.length ? <div className="tasks-list full-task-list">{tasks.map((task) => <div className={`task-item task-row ${task.completed ? "completed-task" : ""}`} key={task.id}><label className="task-checkbox-modern"><input type="checkbox" checked={task.completed} onChange={() => toggle(task.id)} /><span /></label><div className="task-details"><p>{task.title}</p><span className="task-due"><FaCalendarAlt /> {task.dueDate ? new Date(`${task.dueDate}T00:00:00`).toLocaleDateString() : "No deadline"}</span></div><span className={`priority-pill ${task.priority}`}>{task.priority}</span><button className="action-btn danger" onClick={() => persist(tasks.filter((t) => t.id !== task.id))}><FaTrash /></button></div>)}</div> : <EmptyState icon={<FaTasks />} title="No tasks yet" text="Add your first study task above." />}</div></section>
      </div>
    </AppShell>
  );
}
