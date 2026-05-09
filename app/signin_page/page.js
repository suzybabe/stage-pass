"use client";
import { useState } from "react";
import "./signup.css";
import NavBar from "../components/NavBar";

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
  const [errors, setErrors] = useState({}); //created to hold all the errors in one

  function handleChange(e) {
    
    const {name, value} = e.target;
    setFormData({ ...formData, [name]: value});

    setErrors({
      ...errors,
      [name]: ""
    })
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

      //If the request failed (for example validation errors or duplicate email)
      if (!res.ok) {

        //Check if the backend returned validation errors
        if(data.errors){
          setErrors(data.errors);
          setMessage("Please fix all the errors above. ");

        }else{

          //Otherwise show the general backend error message
          setMessage(data.message || "Something went wrong.");
        }

        //Stop function so success code does not run
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
      setErrors({});

    } catch (err) {
      setMessage("Something went wrong.");
    }
  }

  return (
    <>
      <NavBar />

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

          {errors.FirstName && (
            <p className="field-error">{errors.FirstName}</p> //display error message from backend to user
          )}
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

          {errors.LastName && (
            <p className="field-error">{errors.LastName}</p>
          )}
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

          {errors.Email && (
            <p className="field-error">{errors.Email}</p> 
          )}
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

          {errors.Mobile && (
            <p className="field-error">{errors.Mobile}</p>
          )}
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

        {errors.Password && ( 
           <p className="field-error">{errors.Password}</p>
        )}
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
    </>
  );
}
