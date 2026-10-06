import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBrain, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <FaBrain />
          <span>StudyBuddy</span>
        </Link>

        <div className={`nav-menu ${menuOpen ? "active" : ""}`}>
          <a href="/#home" className="nav-link" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/#features" className="nav-link" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="/#about" className="nav-link" onClick={() => setMenuOpen(false)}>About</a>
          <a href="/#contact" className="nav-link" onClick={() => setMenuOpen(false)}>Contact</a>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link nav-btn">Dashboard</Link>
              <button className="nav-link nav-btn primary nav-button-reset" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link nav-btn">Login</Link>
              <Link to="/signup" className="nav-link nav-btn primary">Sign Up</Link>
            </>
          )}
        </div>

        <button className="theme-icon-button" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <FaSun /> : <FaMoon />}
        </button>

        <button
          type="button"
          aria-label="Toggle navigation"
          className={`hamburger hamburger-button ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
