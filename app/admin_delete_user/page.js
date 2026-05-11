"use client";

import { useState } from "react";
import DynamicNavBar from "../components/DynamicNavBar";
import "../login_page/login.css";

export default function AdminDeleteUserPage() {
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");

  async function deleteUser(e) {
    e.preventDefault();

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/users?userId=${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setMessage("User deleted successfully!");
        setUserId("");
      } else {
        setMessage(data.message || "Could not delete user");
  }

} catch (error) {
  console.error(error);
  setMessage("Something went wrong while deleting user");
}
}
  

  return (
    <>
      <DynamicNavBar />

      <main className="login-container">
        <section className="login-header">
          <h1 className="login-title">Delete User</h1>
          <p className="login-subtitle">
            Remove a user account from StagePass.
          </p>
        </section>

        <form className="login-form" onSubmit={deleteUser}>
          <label>
            User ID
            <input
              type="text"
              className="input"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="submit-button">
            Delete User
          </button>
        </form>

        {message && <p className="login-message">{message}</p>}
      </main>
    </>
  );
}