import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBrain,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, resetPassword } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [show, setShow] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await login(form.email, form.password);

      navigate(location.state?.from || "/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setError("Invalid email or password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError(
          "Too many failed login attempts. Please try again later."
        );
      } else {
        setError("Unable to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    if (!form.email.trim()) {
      setError(
        "Enter your email address first, then click Forgot Password."
      );
      return;
    }

    try {
      setResetLoading(true);

      await resetPassword(form.email);

      setSuccess(
        "Password reset email sent. Check your inbox and spam folder."
      );
    } catch (err) {
      console.error("Password reset error:", err);

      if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account was found with this email.");
      } else if (err.code === "auth/too-many-requests") {
        setError(
          "Too many requests. Please wait a little and try again."
        );
      } else {
        setError(
          "Unable to send password reset email. Please try again."
        );
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">

          <div className="auth-header">
            <Link to="/" className="back-home">
              <FaArrowLeft />
            </Link>

            <div className="auth-logo">
              <FaBrain />
              <span>StudyBuddy</span>
            </div>

            <h2>Welcome back</h2>
            <p>Continue your study progress.</p>
          </div>

          {error && (
            <div className="form-alert error">
              {error}
            </div>
          )}

          {success && (
            <div className="form-alert success">
              {success}
            </div>
          )}

          <form className="auth-form" onSubmit={submit}>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type={show ? "text" : "password"}
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                required
                autoComplete="current-password"
                placeholder="Your password"
              />

              <button
                type="button"
                className="password-toggle icon-button-reset"
                onClick={() => setShow((v) => !v)}
                aria-label={
                  show ? "Hide password" : "Show password"
                }
              >
                {show ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="forgot-password-row">
              <button
                type="button"
                className="forgot-password-btn"
                onClick={handleForgotPassword}
                disabled={resetLoading}
              >
                {resetLoading
                  ? "Sending reset email..."
                  : "Forgot Password?"}
              </button>
            </div>

            <button
              type="submit"
              className="btn primary auth-btn"
              disabled={loading || resetLoading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>

          </form>

          <div className="auth-footer">
            <p>
              New to StudyBuddy?{" "}
              <Link to="/signup">
                Create an account
              </Link>
            </p>
          </div>

        </div>

        <div className="auth-decoration">
          <div className="decoration-item item-1" />
          <div className="decoration-item item-2" />
          <div className="decoration-item item-3" />

          <div className="auth-copy">
            <h3>
              One place for your entire study loop.
            </h3>

            <p>
              Notes → AI → recall → focus → progress.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}