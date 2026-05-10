"use client";

import { useState } from "react";
import DynamicNavBar from "../components/DynamicNavBar";
import "../login_page/login.css";

export default function AdminDeleteBookingPage() {
  const [bookingId, setBookingId] = useState("");
  const [message, setMessage] = useState("");

  async function cancelBooking(e) {
    e.preventDefault();

    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) {
      return;
    }

    try {
      const response = await fetch(
        `/api/bookings?bookingId=${bookingId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Booking cancelled successfully!");
        setBookingId("");
      } else {
        setMessage(data.message || "Could not cancel booking");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while cancelling booking");
    }
  }

  return (
    <>
      <DynamicNavBar />

      <main className="login-container">
        <section className="login-header">
          <h1 className="login-title">Cancel Booking</h1>

          <p className="login-subtitle">
            Cancel an existing StagePass booking.
          </p>
        </section>

        <form className="login-form" onSubmit={cancelBooking}>
          <label>
            Booking ID
            <input
              type="text"
              className="input"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="submit-button">
            Cancel Booking
          </button>
        </form>

        {message && <p className="login-message">{message}</p>}
      </main>
    </>
  );
}