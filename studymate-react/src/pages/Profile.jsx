import { useState } from "react";
import { FaUser, FaBullseye, FaBook, FaClock, FaQuestionCircle, FaSave } from "react-icons/fa";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { getProfile, loadBucket, saveBucket } from "../utils/storage";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(() => getProfile(user));
  const sessions = loadBucket("sessions", user.id, []); const quizzes = loadBucket("quizHistory", user.id, []); const notes = loadBucket("notes", user.id, []);
  const save = () => { saveBucket("profile", user.id, profile); updateUser({ name: profile.name }); alert("Profile saved."); };
  return (
    <AppShell title="My Profile" subtitle="Keep your study identity, goals and progress in one place.">
      <div className="profile-layout">
        <section className="dashboard-card profile-card"><div className="card-content profile-summary"><div className="profile-avatar-large">{profile.name.slice(0, 1).toUpperCase()}</div><h2>{profile.name}</h2><p>{profile.course}</p><span>{profile.email}</span></div></section>
        <section className="dashboard-card"><div className="card-header"><h2><FaUser /> About me</h2></div><div className="card-content"><div className="settings-grid"><div className="form-group"><label>Name</label><input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div><div className="form-group"><label>Course / role</label><input value={profile.course} onChange={(e) => setProfile({ ...profile, course: e.target.value })} /></div></div><div className="form-group"><label>Bio</label><textarea rows="4" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></div><div className="form-group"><label>Primary study goal</label><input value={profile.goal} onChange={(e) => setProfile({ ...profile, goal: e.target.value })} /></div><button className="btn primary" onClick={save}><FaSave /> Save Profile</button></div></section>
      </div>
      <div className="stats-grid profile-stats"><div className="stat-card"><div className="stat-icon"><FaBook /></div><div className="stat-info"><h3>Notes</h3><span className="stat-value">{notes.length}</span></div></div><div className="stat-card"><div className="stat-icon"><FaClock /></div><div className="stat-info"><h3>Focus Sessions</h3><span className="stat-value">{sessions.length}</span></div></div><div className="stat-card"><div className="stat-icon"><FaQuestionCircle /></div><div className="stat-info"><h3>Quizzes</h3><span className="stat-value">{quizzes.length}</span></div></div><div className="stat-card"><div className="stat-icon"><FaBullseye /></div><div className="stat-info"><h3>Goal</h3><span className="stat-change goal-copy">{profile.goal}</span></div></div></div>
    </AppShell>
  );
}
