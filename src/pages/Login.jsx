import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateUserCredentials } from "../dataconnect-generated";
import { dataConnect } from "../firebase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await validateUserCredentials(dataConnect, {
        email: email.trim().toLowerCase(),
        password,
      });

      const matchingUser = data.userLists?.[0];

      if (!matchingUser) {
        setError("No matching account was found.");
        return;
      }

      localStorage.setItem("loggedInUserId", matchingUser.id);
      localStorage.setItem(
        "loggedInUserName",
        `${matchingUser.firstname} ${matchingUser.lastname}`.trim()
      );

      navigate("/");
    } catch (loginError) {
      console.error("Login failed", loginError);
      setError(loginError?.message || "Login request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <h1>Login</h1>
      <p>Enter your campus account credentials.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <br />
        <input
          id="email"
          className="input"
          type="email"
          placeholder="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
        <br />
        <br />

        <label htmlFor="password">Password</label>
        <br />
        <input
          id="password"
          className="input"
          type="password"
          placeholder="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />
        <br />
        <br />
        

        {error ? <p style={{ color: "#b00020" }}>{error}</p> : null}

        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Checking..." : "Login"}
        </button>
      </form>
    </div>
  );
}