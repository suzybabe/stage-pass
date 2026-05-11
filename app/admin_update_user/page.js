"use client";

import { useState } from "react";
import DynamicNavBar from "../components/DynamicNavBar";
import "../login_page/login.css";

export default function AdminUpdateUserPage() {
  const [userId, setUserId] = useState("");

  const [formData, setFormData] = useState({
    UserId: "",
    FirstName: "",
    LastName: "",
    Email: "",
    Mobile: "",
    Role: "attendee",
    Password: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function findUser(e) {
    e.preventDefault();

    try {
      const response = await fetch(`/api/users?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setFormData({
          UserId: data.user.UserId,
          FirstName: data.user.FirstName,
          LastName: data.user.LastName,
          Email: data.user.Email,
          Mobile: data.user.Mobile,
          Role: data.user.Role,
          Password: "",
        });

        setMessage("User loaded successfully.");
      } else {
        setMessage(data.message || "User not found");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while finding user");
    }
  }

  async function updateUser(e) {
    e.preventDefault();

    const updateData = { ...formData };

    if (!updateData.Password) {
      delete updateData.Password;
    }

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("User updated successfully!");
      } else {
        setMessage(data.message || "Could not update user");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while updating user");
    }
  }

  return (
    <>
      <DynamicNavBar />

      <main className="login-container">
        <section className="login-header">
          <h1 className="login-title">Update User</h1>
          <p className="login-subtitle">
            Search for a user by ID, then update their account details.
          </p>
        </section>

        <form className="login-form" onSubmit={findUser}>
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
            Find User
          </button>
        </form>

        {formData.UserId && (
          <form className="login-form" onSubmit={updateUser}>
            <label>
              First Name
              <input
                type="text"
                name="FirstName"
                className="input"
                value={formData.FirstName}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Last Name
              <input
                type="text"
                name="LastName"
                className="input"
                value={formData.LastName}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="Email"
                className="input"
                value={formData.Email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Mobile
              <input
                type="text"
                name="Mobile"
                className="input"
                value={formData.Mobile}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Role
              <select
                name="Role"
                className="input"
                value={formData.Role}
                onChange={handleChange}
              >
                <option value="attendee">Attendee</option>
                <option value="organiser">Organiser</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <label>
              New Password
              <input
                type="password"
                name="Password"
                className="input"
                value={formData.Password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
              />
            </label>

            <button type="submit" className="submit-button">
              Update User
            </button>
          </form>
        )}

        {message && <p className="login-message">{message}</p>}
      </main>
    </>
  );
}