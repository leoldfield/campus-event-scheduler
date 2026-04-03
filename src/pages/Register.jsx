import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser, findUserByEmail } from "../dataconnect-generated";
import { dataConnect } from "../firebase";

export default function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [major, setMajor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !age.trim() || !major.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    const parsedAge = Number.parseInt(age, 10);
    if (Number.isNaN(parsedAge) || parsedAge < 0) {
      setError("Please enter a valid age.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    setIsSubmitting(true);

    try {
      const { data: existingUserData } = await findUserByEmail(dataConnect, {
        email: normalizedEmail,
      });

      if (existingUserData.userLists.length > 0) {
        setError("An account with this email already exists.");
        return;
      }

      await createUser(dataConnect, {
        id: crypto.randomUUID(),
        firstname: firstName.trim(),
        lastname: lastName.trim(),
        email: normalizedEmail,
        password,
        age: parsedAge,
        major: major.trim(),
      });

      setSuccessMessage("Account created. Redirecting to login...");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setAge("");
      setMajor("");

      setTimeout(() => navigate("/login"), 700);
    } catch (createError) {
      console.error("Failed to create account", createError);
      const errorMessage = createError?.message || "Failed to create account.";
      if (errorMessage.toLowerCase().includes("unique")) {
        setError("An account with this email already exists.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <h1>Register</h1>
      <p>Create your account.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="firstName">First Name</label><br />
        <input
          id="firstName"
          className="input"
          placeholder="First name"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
        />
        <br /><br />

        <label htmlFor="lastName">Last Name</label><br />
        <input
          id="lastName"
          className="input"
          placeholder="Last name"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
        />
        <br /><br />

        <label htmlFor="email">Email</label><br />
        <input
          id="email"
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
        <br /><br />

        <label htmlFor="password">Password</label><br />
        <input
          id="password"
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
        />
        <br /><br />

        <label htmlFor="age">Age</label><br />
        <input
          id="age"
          className="input"
          type="number"
          placeholder="Age"
          min="0"
          value={age}
          onChange={(event) => setAge(event.target.value)}
        />
        <br /><br />

        <label htmlFor="major">Major</label><br />
        <input
          id="major"
          className="input"
          placeholder="Major"
          value={major}
          onChange={(event) => setMajor(event.target.value)}
        />
        <br /><br />

        {error ? <p style={{ color: "#b00020" }}>{error}</p> : null}
        {successMessage ? <p style={{ color: "#0b6b2f" }}>{successMessage}</p> : null}

        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
  