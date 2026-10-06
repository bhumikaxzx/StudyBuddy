import { Link } from "react-router-dom";
import { FaBrain } from "react-icons/fa";
export default function NotFound() { return <div className="not-found"><FaBrain /><h1>404</h1><h2>Page not found</h2><p>The StudyBuddy page you requested does not exist.</p><Link className="btn primary" to="/">Back Home</Link></div>; }
