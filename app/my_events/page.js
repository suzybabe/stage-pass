"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DynamicNavBar from "../components/DynamicNavBar";
import EventCard from "../components/EventCard";
import "../admin_dashboard/admin.css";
import "../events_page/events.css";

export default function MyEventsPage() {

  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("Loading your events...");

  useEffect(() => {

    async function fetchEvents() {

      try {

        // Get logged in user
        const meResponse = await fetch("/api/me", {
          credentials: "include",
        });

        const meData = await meResponse.json();

        if (!meData.success || !meData.user) {
          setMessage("You must be logged in.");
          return;
        }

        const userId = meData.user.UserId;

        // Fetch all events and keep the ones this organiser runs
        const eventResponse = await fetch("/api/events");
        const eventData = await eventResponse.json();

        if (!eventData.success) {
          setMessage(eventData.message || "Could not load events");
          return;
        }

        const myEvents = eventData.events.filter(
          (event) => event.UserId === userId
        );

        setEvents(myEvents);
        setMessage(myEvents.length === 0 ? "You have not created any events yet." : "");

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
          <h1 className="admin-title">My Events</h1>

          <p className="admin-subtitle">
            Events you are organising. <Link href="/admin_update_event">Update an event</Link>
          </p>
        </section>

        {message && (
          <p className="login-message">{message}</p>
        )}

        <div className="events-grid">
          {events.map((event) => (
            <EventCard key={event.EventId} event={event} />
          ))}
        </div>

      </main>
    </>
  );
}
