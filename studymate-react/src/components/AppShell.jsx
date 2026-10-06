import { NavLink, Link, useLocation } from "react-router-dom";
import {
  FaBrain, FaHome, FaStickyNote, FaRobot, FaLayerGroup, FaQuestionCircle,
  FaClock, FaTasks, FaPaintBrush, FaHistory, FaUser, FaCog, FaSignOutAlt,
  FaMoon, FaSun, FaCalendarAlt
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const links = [
  ["/dashboard", FaHome, "Dashboard"],
  ["/notes", FaStickyNote, "Notes"],
  ["/ai", FaRobot, "AI Workspace"],
  ["/flashcards", FaLayerGroup, "Flashcards"],
  ["/quiz", FaQuestionCircle, "Quiz"],
  ["/study-plan", FaCalendarAlt, "Study Plan"],
  ["/timer", FaClock, "Pomodoro"],
  ["/todo", FaTasks, "Tasks"],
  ["/whiteboard", FaPaintBrush, "Whiteboard"],
  ["/history", FaHistory, "History"],
];

export default function AppShell({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link to="/" className="sidebar-brand"><FaBrain /><span>StudyBuddy</span></Link>
        <nav className="sidebar-nav">
          {links.map(([to, Icon, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <Icon /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}><FaUser /><span>Profile</span></NavLink>
          <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}><FaCog /><span>Settings</span></NavLink>
          <button className="sidebar-link sidebar-button" onClick={logout}><FaSignOutAlt /><span>Logout</span></button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <div className="app-kicker">{location.pathname === "/dashboard" ? "Your learning command center" : "StudyBuddy 2.0"}</div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="topbar-actions">
            <button className="theme-icon-button" onClick={toggleTheme} aria-label="Toggle theme">{theme === "dark" ? <FaSun /> : <FaMoon />}</button>
            <Link className="user-chip" to="/profile">
              <span className="user-avatar-text">{(user?.name || "S").slice(0, 1).toUpperCase()}</span>
              <span><strong>{user?.name || "Student"}</strong><small>{user?.email}</small></span>
            </Link>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>

      <nav className="mobile-app-nav">
        {links.slice(0, 5).map(([to, Icon, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => isActive ? "active" : ""}><Icon /><span>{label === "AI Workspace" ? "AI" : label}</span></NavLink>
        ))}
      </nav>
    </div>
  );
}
