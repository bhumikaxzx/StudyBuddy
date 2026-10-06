import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import AIWorkspace from "./pages/AIWorkspace";
import Flashcards from "./pages/Flashcards";
import Quiz from "./pages/Quiz";
import StudyPlan from "./pages/StudyPlan";
import Timer from "./pages/Timer";
import Todo from "./pages/Todo";
import Whiteboard from "./pages/Whiteboard";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const protectedPage = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
            <Route path="/notes" element={protectedPage(<Notes />)} />
            <Route path="/ai" element={protectedPage(<AIWorkspace />)} />
            <Route path="/summary" element={<Navigate to="/ai" replace />} />
            <Route path="/flashcards" element={protectedPage(<Flashcards />)} />
            <Route path="/quiz" element={protectedPage(<Quiz />)} />
            <Route path="/study-plan" element={protectedPage(<StudyPlan />)} />
            <Route path="/timer" element={protectedPage(<Timer />)} />
            <Route path="/todo" element={protectedPage(<Todo />)} />
            <Route path="/whiteboard" element={protectedPage(<Whiteboard />)} />
            <Route path="/history" element={protectedPage(<History />)} />
            <Route path="/profile" element={protectedPage(<Profile />)} />
            <Route path="/settings" element={protectedPage(<Settings />)} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
