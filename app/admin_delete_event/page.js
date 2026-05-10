"use client";

import { useState } from "react";
import DynamicNavBar from "../components/DynamicNavBar";
import "../login_page/login.css";

export default function AdminDeleteEventPage() {
  const [eventId, setEventId] = useState("");
  const [message, setMessage] = useState("");

  async function deleteEvent(e) {
    e.preventDefault();

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `/api/events?eventId=${eventId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Event deleted successfully!");
        setEventId("");
      } else {
        setMessage(data.message || "Could not delete event");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while deleting event");
    }
  }

  return (
    <>
      <DynamicNavBar />

      <main className="login-container">
        <section className="login-header">
          <h1 className="login-title">Delete Event</h1>

          <p className="login-subtitle">
            Remove an event from StagePass.
          </p>
        </section>

        <form className="login-form" onSubmit={deleteEvent}>
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
            Delete Event
          </button>
        </form>

        {message && <p className="login-message">{message}</p>}
      </main>
    </>
  );
}