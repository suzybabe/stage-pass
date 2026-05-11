"use client";

import { useState } from "react";
import DynamicNavBar from "../components/DynamicNavBar";
import "../login_page/login.css";

export default function AdminCreateUserPage() {
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("API response:", data);

      if (data.success) {
        setMessage("User created successfully!");
      } else {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).join(", ");
          setMessage(errorMessages); //pulling error messages from the api/users
      } else {
        setMessage(data.message || data.error || "Could not create user");
      }
    }
   } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    }
}


  return (
    <>
      <DynamicNavBar />
      
      <main className="login-container">
        <section className="login-header">
          <h1 className="login-title">Create User</h1>
          <p className="login-subtitle">
            Add a new admin, organiser, or attendee.
          </p>
        </section>

        <form className="login-form" onSubmit={handleSubmit}>
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
            Create User
          </button>
        </form>

        {message && <p className="login-message">{message}</p>}
      </main>
    </>
  );
}