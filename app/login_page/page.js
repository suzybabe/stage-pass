"use client";
import { useState } from "react";
import "./login.css";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    Email: "",
    Password: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
  e.preventDefault();

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (data.success) {
      setMessage("Login successful!");

      console.log("User:", data.user);

      // Optional redirect
      // window.location.href = "/";
    } else {
      setMessage(data.message || "Login failed");
    }

  } catch (error) {
    console.error(error);
    setMessage("Something went wrong");
  }
}

  return (
    <main className="login-container">
      <section className="login-header">
        <h1 className="login-title">Sign In</h1>
        <p className="login-subtitle">Access your StagePass account.</p>
      </section>

      <form className="login-form" onSubmit={handleSubmit}>

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

        <button type="submit" className="submit-button">
          Sign In
        </button>
      </form>

      {message && <p className="login-message">{message}</p>}

      <footer className="login-footer">
        © 2026 StagePass — Login Portal
      </footer>
    </main>
  );
}
