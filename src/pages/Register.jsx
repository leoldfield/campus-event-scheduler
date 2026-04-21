import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { createUser, findUserByEmail } from "../dataconnect-generated";
import { auth, getDataConnectClient } from "../firebase";
import { hashPasswordWithArgon2id } from "../security/passwordHashing";
import "../css/Register.css";

export default function Register() {
  const navigate = useNavigate();

  // STEP STATE //
  const [step, setStep] = useState(1);

  // FORM STATE //
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [major, setMajor] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const normalizeEmail = (value) => value.trim().toLowerCase();

  // ===== STEP NAVIGATION ===== //
  const nextStep = () => {
    setError("");

    if (step === 1) {
      if (!firstName.trim() || !lastName.trim()) {
        setError("Please fill out all fields.");
        return;
      }
    }

    if (step === 2) {
      if (!email.trim() || !password) {
        setError("Please complete all fields.");
        return;
      }

      // Strong password rules //
      const hasMinLength = password.length >= 6;
      const hasUppercase = /[A-Z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

      if (!hasMinLength || !hasUppercase || !hasNumber || !hasSpecialChar) {
        setError(
          "Password must be at least 6 characters and include a capital letter, number, and special character."
        );
        return;
      }
    }

    setStep((prev) => prev + 1);


  };

  const prevStep = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  // ===== PROFILE CREATION ===== //
  const createProfileRecord = async ({ user, normalizedEmail, parsedAge }) => {
    const passwordHash = await hashPasswordWithArgon2id(password);


    await createUser(getDataConnectClient(), {
      id: crypto.randomUUID(),
      firebaseUid: user.uid,
      firstname: firstName.trim(),
      lastname: lastName.trim(),
      email: normalizedEmail,
      password: passwordHash,
      age: parsedAge,
      major: major.trim(),
    });


  };

  // ===== FINAL SUBMIT ===== //
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");


    if (!age.trim() || !major.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    const parsedAge = Number.parseInt(age, 10);
    if (Number.isNaN(parsedAge) || parsedAge < 0) {
      setError("Please enter a valid age.");
      return;
    }

    const normalizedEmail = normalizeEmail(email);

    setIsSubmitting(true);

    try {
      const { data: existingUserData } = await findUserByEmail(getDataConnectClient(), {
        email: normalizedEmail,
      });

      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);

      if (existingUserData.userLists.length === 0) {
        await createProfileRecord({
          user: userCredential.user,
          normalizedEmail,
          parsedAge,
        });
      }

      await signOut(auth);

      setSuccessMessage("Account created. Redirecting to login...");

      setTimeout(() => navigate("/login"), 700);
    } catch (createError) {
      console.error("Failed to create account", createError);

      if (createError?.code === "auth/email-already-in-use") {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);

          const { data: existingUserData } = await findUserByEmail(getDataConnectClient(), {
            email: normalizedEmail,
          });

          if (existingUserData.userLists.length > 0) {
            await signOut(auth);
            setError("A Firebase login already exists for this email. Please use Login.");
            return;
          }

          await createProfileRecord({
            user: userCredential.user,
            normalizedEmail,
            parsedAge,
          });

          await signOut(auth);
          setSuccessMessage("Account profile restored. Redirecting...");
          setTimeout(() => navigate("/login"), 700);

        } catch (recoveryError) {
          setError("Failed to restore deleted profile.");
        }
      } else if (createError?.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else {
        setError(createError?.message || "Failed to create account.");
      }
    } finally {
      setIsSubmitting(false);
    }


  };

  return (<div className="create-event-wrapper">
    <div className="create-event-card">

      <h1>Register</h1>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <p>Step {step} of 4</p>

      <div className="form-report">
        {error && <p style={{ color: "#b00020" }}>{error}</p>}
        {successMessage && <p style={{ color: "#0b6b2f" }}>{successMessage}</p>}
      </div>

      <form onSubmit={handleSubmit} className="create-event-form">

        {/* STEP 1 */}
        {step === 1 && (
          <div className="form-step">
            <h2>Basic Info</h2>

            <input
              className="input"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <input
              className="input"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />

            <button type="button" className="stepButtonNext" onClick={nextStep}>
              Next
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="form-step">
            <h2>Account Info</h2>

            <input
              className="input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <p className="password-hint">
              Must be 6+ characters, include a capital letter, number, and special character.
            </p>

            <div className="step-buttons">
              <button type="button" className="stepButtonBack" onClick={prevStep}>Back</button>
              <button type="button" className="stepButtonNext" onClick={nextStep}>Next</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="form-step">
            <h2>Additional Info</h2>

            <input className="input" type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
            <input className="input" placeholder="Major" value={major} onChange={(e) => setMajor(e.target.value)} />

            <div className="step-buttons">
              <button type="button" className="stepButtonBack" onClick={prevStep}>Back</button>
              <button type="button" className="stepButtonNext" onClick={nextStep}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="form-step">
            <h2>Review</h2>

            <div className="review-item">
              <span className="review-label">Name</span>
              <span className="review-value">{firstName} {lastName}</span>
            </div>

            <div className="review-item">
              <span className="review-label">Email</span>
              <span className="review-value">{email}</span>
            </div>

            <div className="review-item">
              <span className="review-label">Age</span>
              <span className="review-value">{age}</span>
            </div>

            <div className="review-item">
              <span className="review-label">Major</span>
              <span className="review-value">{major}</span>
            </div>

            <div className="step-buttons">
              <button type="button" className="stepButtonBack" onClick={prevStep}>Back</button>
              <button className="createAccountButton" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Account"}
              </button>
            </div>
          </div>
        )}

      </form>

      <div className="authenticateText">
        <p className="auth-switch">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login here</span>
        </p>
      </div>
    </div>
  </div>

  );
}