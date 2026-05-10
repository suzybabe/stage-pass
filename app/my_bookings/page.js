"use client";

import { useEffect, useState } from "react";
import DynamicNavBar from "../components/DynamicNavBar";
import "../admin_dashboard/admin.css";

export default function MyBookingsPage() {

  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {

    async function fetchBookings() {

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

        // Fetch bookings for this attendee
        const bookingResponse = await fetch(
          `/api/bookings?userId=${userId}`
        );

        const bookingData = await bookingResponse.json();

        if (bookingData.success) {
          setBookings(bookingData.bookings);
        } else {
          setMessage(
            bookingData.message || "Could not load bookings"
          );
        }

      } catch (error) {
        console.error(error);
        setMessage("Something went wrong while loading bookings");
      }
    }

    fetchBookings();

  }, []);

  return (
    <>
      <DynamicNavBar />

      <main className="admin-container">

        <section className="admin-header">
          <h1 className="admin-title">My Bookings</h1>

          <p className="admin-subtitle">
            View your booked StagePass events.
          </p>
        </section>

        {message && (
          <p className="login-message">{message}</p>
        )}

        <section className="admin-card">

          {bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (

            <table className="users-table">

              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Tickets</th>
                  <th>Total Price</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {bookings.map((booking) => (

                  <tr key={booking.BookingId}>
                    <td>{booking.BookingId}</td>
                    <td>{booking.Title}</td>
                    <td>{booking.EventDate}</td>
                    <td>{booking.NumberOfTickets}</td>
                    <td>€{booking.TotalPrice}</td>
                    <td>{booking.Status}</td>
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