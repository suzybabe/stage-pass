"use client";

import { useState } from "react";
import DynamicNavBar from "../components/DynamicNavBar";
import "../login_page/login.css";

export default function AdminUpdateEventPage() {
  const [eventId, setEventId] = useState("");

  const [formData, setFormData] = useState({
    eventId: "",
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

  async function findEvent(e) {
    e.preventDefault();
   

    try {
      const response = await fetch(`/api/events?eventId=${eventId}`);
      const data = await response.json();
      

      if (data.success) {
        setFormData({
          eventId: data.event.EventId,
          Title: data.event.Title,
          Description: data.event.Description,
          Location: data.event.Location,
          EventDate: data.event.EventDate?.split("T")[0],
          EventTime: data.event.EventTime?.slice(0, 5),
          Capacity: data.event.Capacity,
          Price: data.event.Price,
          EventType: data.event.EventType,
          OrganiserId: data.event.OrganiserId || data.event.UserId || "",
        });

        setMessage("Event loaded successfully.");
      } else {
        setMessage(data.message || "Event not found");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while finding event");
    }
  }

  async function updateEvent(e) {
    e.preventDefault();

    try {
      const response = await fetch("/api/events", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
          ...formData,
          Capacity: Number(formData.Capacity),
          Price: Number(formData.Price),
          OrganiserId: Number(formData.OrganiserId),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Event updated successfully!");
      } else if (data.errors) {
        setMessage(Object.values(data.errors).join(", "));
      } else {
        setMessage(data.message || "Could not update event");
      }   
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while updating event");
    }
  }

  return (
    <>
      <DynamicNavBar />

      <main className="login-container">
        <section className="login-header">
          <h1 className="login-title">Update Event</h1>

          <p className="login-subtitle">
            Search for an event by ID, then update its details.
          </p>
        </section>

        <form className="login-form" onSubmit={findEvent}>
          <label>
            Event ID
            <input
              type="text"
              className="input"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="submit-button">
            Find Event
          </button>
        </form>

        {formData.eventId && (
          <form className="login-form" onSubmit={updateEvent}>
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
             type="number"
             name="OrganiserId"
             className="input"
             value={formData.OrganiserId || ""}
             onChange={handleChange}
             required
           />
        </label>

            <button type="submit" className="submit-button">
              Update Event
            </button>
          </form>
        )}

        {message && <p className="login-message">{message}</p>}
      </main>
    </>
  );
}