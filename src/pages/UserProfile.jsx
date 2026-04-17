import React, { useEffect, useState } from "react";
import {
  findUserByEmail,
  getUserByFirebaseUid,
  updateUserProfile,
} from "../dataconnect-generated";
import { auth, getDataConnectClient } from "../firebase";

export default function UserProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profileId, setProfileId] = useState("");
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    age: "",
    major: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user || null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser || currentUser.isAnonymous) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setSuccessMessage("");

      try {
        let matchedUser = null;

        try {
          const uidResult = await getUserByFirebaseUid(getDataConnectClient(), {
            firebaseUid: currentUser.uid,
          });
          matchedUser = uidResult.data?.userLists?.[0] || null;
        } catch (uidError) {
          console.warn("User not found by firebase uid, trying email fallback", uidError);
        }

        if (!matchedUser && currentUser.email) {
          const emailResult = await findUserByEmail(getDataConnectClient(), {
            email: currentUser.email.toLowerCase(),
          });
          matchedUser = emailResult.data?.userLists?.[0] || null;
        }

        if (!matchedUser) {
          setError("Could not find your profile.");
          setLoading(false);
          return;
        }

        setProfileId(matchedUser.id);
        setFormData({
          firstname: matchedUser.firstname || "",
          lastname: matchedUser.lastname || "",
          email: matchedUser.email || currentUser.email || "",
          age: matchedUser.age != null ? String(matchedUser.age) : "",
          major: matchedUser.major || "",
        });
      } catch (loadError) {
        console.error("Failed to load profile", loadError);
        setError(loadError?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!currentUser || currentUser.isAnonymous) {
      setError("Please log in to edit your profile.");
      return;
    }

    if (
      !profileId ||
      !formData.firstname.trim() ||
      !formData.lastname.trim() ||
      !formData.age.trim() ||
      !formData.major.trim()
    ) {
      setError("Please fill out all editable fields.");
      return;
    }

    const parsedAge = Number.parseInt(formData.age, 10);
    if (Number.isNaN(parsedAge) || parsedAge < 0) {
      setError("Please enter a valid age.");
      return;
    }

    setSaving(true);

    try {
      await updateUserProfile(getDataConnectClient(), {
        id: profileId,
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        age: parsedAge,
        major: formData.major.trim(),
      });

      setSuccessMessage("Profile updated successfully.");
    } catch (saveError) {
      console.error("Failed to update profile", saveError);
      setError(saveError?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "24px" }}>
        <h1>User Profile</h1>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!currentUser || currentUser.isAnonymous) {
    return (
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "24px" }}>
        <h1>User Profile</h1>
        <p>Please log in to view and edit your profile.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "24px" }}>
      <h1>User Profile</h1>
      <p>View and update your account information below.</p>

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      {successMessage ? <p style={{ color: "green" }}>{successMessage}</p> : null}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "16px",
          marginTop: "24px",
          padding: "24px",
          border: "1px solid #ddd",
          borderRadius: "12px",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div>
          <label htmlFor="firstname" style={{ display: "block", marginBottom: "6px" }}>
            First Name
          </label>
          <input
            id="firstname"
            name="firstname"
            type="text"
            value={formData.firstname}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />

        </div>

        <div>
          <label htmlFor="lastname" style={{ display: "block", marginBottom: "6px" }}>
            Last Name
          </label>
          <input
            id="lastname"
            name="lastname"
            type="text"
            value={formData.lastname}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />






























































        </div>

        <div>
          <label htmlFor="email" style={{ display: "block", marginBottom: "6px" }}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            readOnly
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              backgroundColor: "#f3f3f3",
            }}
          />
        </div>

        <div>
          <label htmlFor="age" style={{ display: "block", marginBottom: "6px" }}>
            Age
          </label>
          <input
            id="age"
            name="age"
            type="number"
            min="0"
            value={formData.age}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div>
          <label htmlFor="major" style={{ display: "block", marginBottom: "6px" }}>
            Major
          </label>
          <input
            id="major"
            name="major"
            type="text"
            value={formData.major}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#b30000",
            color: "white",
            fontWeight: "600",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}