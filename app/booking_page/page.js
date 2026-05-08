"use client";
import { useState } from "react";
import "./booking.css";

export default function BookingPage() {
  const [formData, setFormData] = useState({
    UserId: "",
    EventId: "",
    NumberOfTickets: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Error: " + JSON.stringify(data.errors));
        return;
      }

      setMessage("Booking confirmed! Booking ID: " + data.booking.bookingId);
      setFormData({ UserId: "", EventId: "", NumberOfTickets: "" });

    } catch (err) {
      setMessage("Something went wrong.");
    }
  }

  return (
    <>
      <main className="booking-container">

        <section className="booking-header">
          <h1 className="booking-title">Book Your Tickets</h1>
          <p className="booking-subtitle">
            Enter your details below and secure your spot.
          </p>
        </section>

        <form className="booking-form" onSubmit={handleSubmit}>

          <label>
            User ID
            <input
              type="number"
              name="UserId"
              className="input"
              value={formData.UserId}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Event ID
            <input
              type="number"
              name="EventId"
              className="input"
              value={formData.EventId}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Number of Tickets
            <input
              type="number"
              name="NumberOfTickets"
              className="input"
              min="1"
              max="10"
              value={formData.NumberOfTickets}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" className="submit-button">
            Submit Booking
          </button>

        </form>

        {message && <p className="booking-message">{message}</p>}

        <footer className="booking-footer">
          © 2026 StagePass — Event Booking Portal
        </footer>

      </main>
    </>
  );
}
