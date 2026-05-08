"use client";
import { useEffect, useState } from "react";
import "./events.css";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("Loading events...");

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();

        if (!res.ok) {
          setMessage("Failed to load events");
          return;
        }

        if (data.events.length === 0) {
          setMessage("No events available");
          return;
        }

        setEvents(data.events);
        setMessage("");
      } catch (err) {
        setMessage("Error loading events");
      }
    }

    loadEvents();
  }, []);

  return (
    <main className="events-container">
      <h1 className="events-title">Upcoming Events</h1>

      {message && <p className="events-message">{message}</p>}

      <div className="events-grid">
        {events.map((event) => (
          <div key={event.EventId} className="event-card">
            <h2 className="event-name">{event.Title}</h2>

            <p className="event-description">{event.Description}</p>

            <p className="event-detail">
              <strong>Date:</strong> 
              {event.EventDate ? new Date(event.EventDate).toLocaleDateString() : ""}
            </p>
            <p className="event-detail">
              <strong>Time:</strong> {event.EventTime}
            </p>
            <p className="event-detail">
              <strong>Location:</strong> {event.Location}
            </p>

            <p className="event-detail">
              <strong>Price:</strong> €{event.Price}
            </p>

            <p className="event-detail">
              <strong>Capacity:</strong> {event.Capacity}
            </p>

            <p className="event-detail">
              <strong>Type:</strong> {event.EventType}
            </p>

            <p className="event-organiser">
              Organised by: {event.FirstName} {event.LastName} ({event.Email})
            </p>
          </div>
        ))}
      </div>

      <footer className="events-footer">
        © 2026 StagePass — Events Directory
      </footer>
    </main>
  );
}
