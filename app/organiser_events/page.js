"use client";

import DynamicNavBar from "../components/DynamicNavBar";
import "../login_page/login.css";

export default function OrganiserEventsPage() {
  return (
    <>
      <DynamicNavBar />

      <main className="login-container">
        <section className="login-header">
          <h1 className="login-title">My Events</h1>
          <p className="login-subtitle">
            View, update, or delete your own events.
          </p>
        </section>

        <section className="login-form">
          <h2 className="card-title">Your Events</h2>
          <p className="card-text">
            Your created events will appear here.
          </p>

          <button className="submit-button">
            Load My Events
          </button>
        </section>
      </main>
    </>
  );
}