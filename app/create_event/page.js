"use client";

import DynamicNavBar from "../components/DynamicNavBar";
import EventForm from "../components/EventForm";
import "../login_page/login.css";

export default function AdminCreateEventPage() {
  return (
    <>
      <DynamicNavBar />

      <main className="login-container">
        <section className="login-header">
          <h1 className="login-title">Create Event</h1>
          <p className="login-subtitle">Add a new event to StagePass.</p>
        </section>

        <EventForm />
      </main>
    </>
  );
}