"use client";

import { useEffect, useState } from "react";
import DynamicNavBar from "../components/DynamicNavBar";
import "../admin_dashboard/admin.css";

export default function AdminViewEventsPage() {
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events");
        const data = await response.json();

        if (data.success) {
          setEvents(data.events);
        } else {
          setMessage(data.message || "Could not load events");
        }
      } catch (error) {
        console.error(error);
        setMessage("Something went wrong while loading events");
      }
    }

    fetchEvents();
  }, []);

  return (
    <>
      <DynamicNavBar />

      <main className="admin-container">
        <section className="admin-header">
          <h1 className="admin-title">View All Events</h1>
          <p className="admin-subtitle">
            Display all StagePass events from the database.
          </p>
        </section>

        {message && <p className="login-message">{message}</p>}

        <section className="admin-card">
          {events.length === 0 ? (
            <p>No events found.</p>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Price</th>
                  <th>Capacity</th>
                  <th>Type</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr key={event.EventId}>
                    <td>{event.EventId}</td>
                    <td>{event.Title}</td>
                    <td>{event.Location}</td>
                    <td>{event.EventDate}</td>
                    <td>{event.EventTime}</td>
                    <td>€{event.Price}</td>
                    <td>{event.Capacity}</td>
                    <td>{event.EventType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </>
  );
}