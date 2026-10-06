import { Link } from "react-router-dom";
import { FaBrain, FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">

          <div className="footer-section">
            <div className="footer-logo">
              <FaBrain />
              <span>StudyBuddy</span>
            </div>

            <p>
              AI-powered study tools for notes, active recall, focus,
              productivity and progress tracking.
            </p>

            <div className="social-links">
              <a
                href="https://github.com/bhumikaxzx/StudyBuddy"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              >
                <FaGithub />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Study</h3>
            <ul>
              <li>
                <Link to="/notes">Notes</Link>
              </li>
              <li>
                <Link to="/ai">Ask AI</Link>
              </li>
              <li>
                <Link to="/flashcards">Flashcards</Link>
              </li>
              <li>
                <Link to="/quiz">Quiz</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Productivity</h3>
            <ul>
              <li>
                <Link to="/timer">Pomodoro</Link>
              </li>
              <li>
                <Link to="/todo">Tasks</Link>
              </li>
              <li>
                <Link to="/whiteboard">Whiteboard</Link>
              </li>
              <li>
                <Link to="/history">Progress</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Account</h3>
            <ul>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                <Link to="/settings">Settings</Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} StudyBuddy. Built for focused learning.
          </p>
        </div>
      </div>
    </footer>
  );
}