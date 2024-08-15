import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase-config";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

export default function Profile() {
  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = useState(
    currentUser?.displayName || ""
  );
  const [email, setEmail] = useState(currentUser?.email || "");
  const [gender, setGender] = useState(currentUser?.gender || "");
  const [age, setAge] = useState(currentUser?.age || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await updateProfile(currentUser, {
        displayName: displayName,
        gender: gender,
        age: age,
      });
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("email", "==", email));
      const querySanpshot = await getDocs(q);
      const userDoc = querySanpshot.docs[0];
      const userDocRef = userDoc.ref;
      await updateDoc(userDocRef, {
        displayName: displayName,
        gender: gender,
        age: age,
      });
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile: " + err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmNewPassword) {
      return setError("Passwords do not match");
    }

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      setMessage("Password updated successfully!");
    } catch (err) {
      setError("Failed to update password: " + err.message);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-details">
        <div style={{ display: "flex", columnGap: "20px" }}>
          <div style={{ width: "50%" }}>
            <h2>User Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <div>
                <label>Name:</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Name"
                />
              </div>
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  disabled
                />
              </div>
              <div>
                <label>Gender:</label>
                <input
                  type="text"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  placeholder="Gender"
                />
              </div>
              <div>
                <label>Age:</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Age"
                />
              </div>
              <button type="submit">Update Profile</button>
            </form>
          </div>
          <div style={{ width: "50%" }}>
            <h2>Change Password</h2>
            <form onSubmit={handleChangePassword}>
              <div>
                <label>Current Password:</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current Password"
                />
              </div>
              <div>
                <label>New Password:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                />
              </div>
              <div>
                <label>Confirm New Password:</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm New Password"
                />
              </div>
              <button type="submit">Change Password</button>
            </form>
          </div>
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}
