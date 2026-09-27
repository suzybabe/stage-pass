"use client";

import { useEffect, useState } from "react";
import DynamicNavBar from "../components/DynamicNavBar";
import "../admin_dashboard/admin.css";

export default function OrganiserBookingsPage() {

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

        const organiserId = meData.user.UserId;

        // Fetch bookings for this organiser's events
        const bookingResponse = await fetch(
          `/api/bookings?organiserId=${organiserId}`
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
          <h1 className="admin-title">Event Bookings</h1>

          <p className="admin-subtitle">
            Bookings made for the events you organise.
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
                  <th>Attendee</th>
                  <th>Email</th>
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
                    <td>{booking.FirstName} {booking.LastName}</td>
                    <td>{booking.Email}</td>
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
