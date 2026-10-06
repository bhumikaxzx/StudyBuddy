import { Link } from "react-router-dom";
import {
  FaBook, FaLightbulb, FaTasks, FaChartLine, FaFileUpload, FaRobot, FaLayerGroup,
  FaQuestionCircle, FaHourglassHalf, FaHistory, FaComments, FaPaintBrush,
  FaGraduationCap, FaCheckCircle, FaArrowRight, FaEnvelope
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const features = [
  [FaFileUpload, "PDF & Notes Upload", "Upload PDFs, TXT or Markdown and turn them into searchable study material."],
  [FaRobot, "RAG-based Q&A", "Ask questions against your own notes and get context-grounded answers."],
  [FaLightbulb, "AI Summaries", "Condense long material into focused bullet points for fast revision."],
  [FaLayerGroup, "Smart Flashcards", "Generate active-recall cards from your notes and mark mastered concepts."],
  [FaQuestionCircle, "Quiz Generator", "Create practice quizzes and track scores over time."],
  [FaTasks, "Task Manager", "Plan assignments and study tasks with priorities and deadlines."],
  [FaHourglassHalf, "Pomodoro Focus", "Run focused study sessions and automatically log your time."],
  [FaChartLine, "Progress Analytics", "See study time, quiz performance, task completion and activity history."],
  [FaPaintBrush, "Whiteboard", "Sketch diagrams, formulas and mind maps without leaving your study workspace."],
];

export default function Home() {
  return (
    <>
      <Navbar />
      <section id="home" className="hero sb-hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge"><FaGraduationCap /> AI Study Assistant 2.0</div>
            <h1 className="hero-title">Turn your study material into <span className="gradient-text">understanding.</span></h1>
            <p className="hero-subtitle">StudyBuddy combines notes, PDF Q&A, summaries, flashcards, quizzes, focus tools and progress tracking in one learning workspace.</p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn primary">Start Studying <FaArrowRight /></Link>
              <a href="#features" className="btn secondary">Explore Features</a>
            </div>
            <div className="hero-proof">
              <span><FaCheckCircle /> Active recall</span>
              <span><FaCheckCircle /> Focus tracking</span>
              <span><FaCheckCircle /> Your own notes as context</span>
            </div>
          </div>

          <div className="hero-image">
            <div className="floating-card card-1"><FaBook /><span>Smart Notes</span></div>
            <div className="floating-card card-2"><FaLightbulb /><span>AI Summary</span></div>
            <div className="floating-card card-3"><FaTasks /><span>Study Plan</span></div>
            <div className="floating-card card-4"><FaChartLine /><span>Progress</span></div>
            <div className="dashboard-preview upgraded-preview">
              <div className="preview-header"><div className="preview-dots"><span /><span /><span /></div><b>StudyBuddy</b></div>
              <div className="preview-content">
                <div className="preview-chart" />
                <div className="preview-stats">
                  <div className="stat"><span className="stat-value">87%</span><span className="stat-label">Progress</span></div>
                  <div className="stat"><span className="stat-value">24</span><span className="stat-label">Sessions</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Everything you need to study effectively</h2>
          <p className="section-subtitle">A practical student workspace instead of separate apps for notes, revision, planning and focus.</p>
          <div className="features-grid">
            {features.map(([Icon, title, description]) => (
              <div className="feature-card" key={title}>
                <div className="feature-icon"><Icon /></div>
                <h3>{title}</h3><p>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <div className="eyebrow">Built for real study workflows</div>
              <h2 className="section-title left-title">From reading to recall, in one flow.</h2>
              <p>Upload material, extract the useful ideas, ask questions, turn concepts into flashcards or a quiz, then focus with Pomodoro and track what you actually completed.</p>
              <p>StudyBuddy is designed as a modular learning workspace, so AI features, cloud sync and new study tools can grow without turning the codebase into a single large page.</p>
              <div className="stats">
                <div className="stat-item"><span className="stat-number">1</span><span className="stat-label">Workspace</span></div>
                <div className="stat-item"><span className="stat-number">9+</span><span className="stat-label">Study Tools</span></div>
                <div className="stat-item"><span className="stat-number">24/7</span><span className="stat-label">Study Companion</span></div>
              </div>
            </div>
            <div className="about-image">
              <div className="image-container"><div className="floating-element el-1" /><div className="floating-element el-2" /><div className="floating-element el-3" /><div className="main-image"><FaGraduationCap /></div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <div className="container">
          <h2 className="section-title">Get in touch</h2>
          <p className="section-subtitle">Have feedback or a feature idea for StudyBuddy?</p>
          <div className="contact-content contact-simple">
            <div className="contact-card-large">
              <FaEnvelope />
              <div><h3>Project feedback</h3><p>Use this section for your portfolio demo, project feedback, or replace it with your real contact information.</p></div>
            </div>
            <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert("Demo form submitted. Connect an email service before production."); }}>
              <div className="form-group"><input required placeholder="Your name" /></div>
              <div className="form-group"><input type="email" required placeholder="Your email" /></div>
              <div className="form-group"><textarea required rows="5" placeholder="Your message" /></div>
              <button className="btn primary" type="submit">Send Message</button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
