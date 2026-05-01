import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { findUserByEmail, getUserByFirebaseUid } from "../dataconnect-generated";
import { auth, getDataConnectClient } from "../firebase";
import "../css/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const normalizeEmail = (value) => value.trim().toLowerCase();

  const normalizeUuid = (value) => {
    const compactHex = String(value || "").replace(/-/g, "").toLowerCase();
    if (/^[0-9a-f]{32}$/.test(compactHex)) {
      return `${compactHex.slice(0, 8)}-${compactHex.slice(8, 12)}-${compactHex.slice(12, 16)}-${compactHex.slice(16, 20)}-${compactHex.slice(20)}`;
    }

    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ""))) {
      return String(value).toLowerCase();
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedEmail = normalizeEmail(email);

      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      await userCredential.user.getIdToken(true);

      const { data: firebaseUidData } = await getUserByFirebaseUid(getDataConnectClient(), {
        firebaseUid: userCredential.user.uid,
      });

      let matchingUser = firebaseUidData.userLists?.[0];

      if (!matchingUser) {
        const { data } = await findUserByEmail(getDataConnectClient(), {
          email: normalizedEmail,
        });

        matchingUser = data.userLists?.[0];
      }

      if (!matchingUser) {
        setError("Your account exists in Firebase Auth but is missing a profile record. Please register again.");
        return;
      }

      const normalizedUserId = normalizeUuid(matchingUser.id);
      if (!normalizedUserId) {
        setError("Login succeeded but user ID format is invalid.");
        return;
      }

      localStorage.setItem("loggedInUserId", normalizedUserId);
      localStorage.setItem(
        "loggedInUserName",
        `${matchingUser.firstname} ${matchingUser.lastname}`.trim()
      );

      navigate("/");
    } catch (loginError) {
      console.error("Login failed", loginError);
      if (
        loginError?.code === "auth/invalid-credential" ||
        loginError?.code === "auth/user-not-found" ||
        loginError?.code === "auth/wrong-password"
      ) {
        setError("Invalid email or password.");
      } else if (loginError?.code === "auth/operation-not-allowed") {
        setError("Email/Password sign-in is disabled in Firebase Authentication. Enable it in Firebase Console > Authentication > Sign-in method.");
      } else if (loginError?.code === "auth/too-many-requests") {
        setError("Too many login attempts. Try again later.");
      } else {
        setError(loginError?.message || "Login request failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Enter your campus account credentials to login.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="e.g. student@ualr.edu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="form-report">
              <p className="error-text">{error}</p>
            </div>
          )}

          <button className="submitButton" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Checking..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-switch">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/register")}>
              Register here
            </span>
          </p>
        </div>

      </div>
    </div>
  );}