"use client";

import { useState } from "react";
import DynamicNavBar from "./DynamicNavBar";

export default function EventForm() {
  const [formData, setFormData] = useState({
    Title: "",
    Description: "",
    Location: "",
    EventDate: "",
    EventTime: "",
    Capacity: "",
    Price: "",
    EventType: "Concert",
    OrganiserId: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function createEvent(e) {
    e.preventDefault();

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Event created successfully!");

        setFormData({
          Title: "",
          Description: "",
          Location: "",
          EventDate: "",
          EventTime: "",
          Capacity: "",
          Price: "",
          EventType: "Concert",
          OrganiserId: "",
        });
      } else {
        if (data.errors) {
          setMessage(Object.values(data.errors).join(" | "));
        } else {
          setMessage(data.message || "Could not create event");
        }
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while creating event");
    }
  }

  return (
    <>
    
      <form className="login-form" onSubmit={createEvent}>
        <label>
          Title
          <input
            type="text"
            name="Title"
            className="input"
            value={formData.Title}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Description
          <input
            type="text"
            name="Description"
            className="input"
            value={formData.Description}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Location
          <input
            type="text"
            name="Location"
            className="input"
            value={formData.Location}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Event Date
          <input
            type="date"
            name="EventDate"
            className="input"
            value={formData.EventDate}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Event Time
          <input
            type="time"
            name="EventTime"
            className="input"
            value={formData.EventTime}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Capacity
          <input
            type="number"
            name="Capacity"
            className="input"
            value={formData.Capacity}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Price
          <input
            type="number"
            step="0.01"
            name="Price"
            className="input"
            value={formData.Price}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Event Type
          <select
            name="EventType"
            className="input"
            value={formData.EventType}
            onChange={handleChange}
          >
            <option value="Concert">Concert</option>
            <option value="Workshop">Workshop</option>
            <option value="Festival">Festival</option>
            <option value="Theatre">Theatre</option>
            <option value="Comedy">Comedy</option>
            <option value="Sports">Sports</option>
          </select>
        </label>

        <label>
          Organiser ID
          <input
            type="text"
            name="OrganiserId"
            className="input"
            value={formData.OrganiserId}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" className="submit-button">
          Create Event
        </button>
      </form>

      {message && <p className="login-message">{message}</p>}
    </>
  );
}