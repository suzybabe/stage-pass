"use client";

import DynamicNavBar from "../components/DynamicNavBar";
import "../login_page/login.css";

export default function OrganiserBookingsPage() {
  return (
    <>
      <DynamicNavBar />

      <main className="login-container">
        <section className="login-header">
          <h1 className="login-title">Event Bookings</h1>
          <p className="login-subtitle">
            View bookings for your events.
          </p>
        </section>

        <section className="login-form">
          <h2 className="card-title">Bookings</h2>
          <p className="card-text">
            Bookings for your events will appear here.
          </p>

          <button className="submit-button">
            Load Bookings
          </button>
        </section>
      </main>
    </>
  );
}