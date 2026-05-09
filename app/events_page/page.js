"use client";
import { useEffect, useState } from "react";
import "./events.css";
import EventCard from "../components/EventCard";

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

      {/*Importing components/EventCard to avoid duplicate code as it will be used in other pages */}
      {events.map((event) => (
         <EventCard
           key={event.EventId}
           event={event}
         />
      ))}
      </div>

      <footer className="events-footer">
        © 2026 StagePass — Events Directory
      </footer>
    </main>
  );
}
