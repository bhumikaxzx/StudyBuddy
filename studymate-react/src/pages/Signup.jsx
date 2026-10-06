import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBrain,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRules = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(form.password),
  };

  const isStrongPassword =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.lowercase &&
    passwordRules.number &&
    passwordRules.special;

  const passwordsMatch =
    form.confirm.length > 0 &&
    form.password === form.confirm;

  const validatePassword = () => {
    if (!passwordRules.length) {
      return "Password must be at least 8 characters.";
    }

    if (!passwordRules.uppercase) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!passwordRules.lowercase) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!passwordRules.number) {
      return "Password must contain at least one number.";
    }

    if (!passwordRules.special) {
      return "Password must contain at least one special character.";
    }

    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const passwordError = validatePassword();

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await signup({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      navigate("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);

      if (err.code === "auth/email-already-in-use") {
        setError(
          "This email is already registered. Please login instead."
        );
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Please choose a stronger password.");
      } else if (err.code === "auth/network-request-failed") {
        setError(
          "Network error. Please check your internet connection."
        );
      } else if (err.code === "auth/too-many-requests") {
        setError(
          "Too many attempts. Please wait a moment and try again."
        );
      } else {
        setError(
          "Unable to create account. Please try again."
        );
      }
    } finally {
      setLoading(false);
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

            <h2>Create your account</h2>

            <p>
              Start building a smarter study system.
            </p>
          </div>

          {error && (
            <div className="form-alert error">
              {error}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={submit}
          >
            <div className="form-group">
              <label>Name</label>

              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                required
                autoComplete="name"
                placeholder="Your name"
              />
            </div>

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
                autoComplete="new-password"
                placeholder="Create a strong password"
              />

              <button
                type="button"
                className="password-toggle icon-button-reset"
                onClick={() =>
                  setShow((current) => !current)
                }
                aria-label={
                  show
                    ? "Hide password"
                    : "Show password"
                }
              >
                {show ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>
            </div>

            {form.password && (
              <div className="password-rules">
                <PasswordRule
                  valid={passwordRules.length}
                  text="At least 8 characters"
                />

                <PasswordRule
                  valid={passwordRules.uppercase}
                  text="One uppercase letter"
                />

                <PasswordRule
                  valid={passwordRules.lowercase}
                  text="One lowercase letter"
                />

                <PasswordRule
                  valid={passwordRules.number}
                  text="One number"
                />

                <PasswordRule
                  valid={passwordRules.special}
                  text="One special character"
                />
              </div>
            )}

            <div className="form-group">
              <label>Confirm password</label>

              <input
                type={show ? "text" : "password"}
                value={form.confirm}
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirm: e.target.value,
                  })
                }
                required
                autoComplete="new-password"
                placeholder="Confirm your password"
              />
            </div>

            {form.confirm && (
              <div
                className={
                  passwordsMatch
                    ? "password-match success"
                    : "password-match error-text"
                }
              >
                {passwordsMatch ? (
                  <>
                    <FaCheckCircle />
                    Passwords match
                  </>
                ) : (
                  <>
                    <FaTimesCircle />
                    Passwords do not match
                  </>
                )}
              </div>
            )}

            <button
              type="submit"
              className="btn primary auth-btn"
              disabled={
                loading ||
                !isStrongPassword ||
                !passwordsMatch
              }
            >
              {loading
                ? "Creating..."
                : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login">
                Login
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
              Build your personal learning dashboard.
            </h3>

            <p>
              Plan, focus, practice and review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordRule({ valid, text }) {
  return (
    <div
      className={`password-rule ${
        valid ? "valid" : "invalid"
      }`}
    >
      {valid ? (
        <FaCheckCircle />
      ) : (
        <FaTimesCircle />
      )}

      <span>{text}</span>
    </div>
  );
}