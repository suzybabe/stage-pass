"use client";
import { useState } from "react";
import "./signup.css";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    Mobile: "",
    Password: "",
    Role: "attendee",
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || JSON.stringify(data.errors));
        return;
      }

      setMessage("Account created successfully!");
      setFormData({
        FirstName: "",
        LastName: "",
        Email: "",
        Mobile: "",
        Password: "",
        Role: "attendee",
      });

    } catch (err) {
      setMessage("Something went wrong.");
    }
  }

  return (
    <main className="signup-container">
      <section className="signup-header">
        <h1 className="signup-title">Create Your Account</h1>
        <p className="signup-subtitle">Join StagePass and start booking events.</p>
      </section>

      <form className="signup-form" onSubmit={handleSubmit}>

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
          Mobile (10 digits)
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
          Password
          <input
            type="password"
            name="Password"
            className="input"
            value={formData.Password}
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

        <button type="submit" className="submit-button">
          Create Account
        </button>
      </form>

      {message && <p className="signup-message">{message}</p>}

      <footer className="signup-footer">
        © 2026 StagePass — User Registration
      </footer>
    </main>
  );
}
