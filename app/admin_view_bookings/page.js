"use client";

import { useEffect, useState } from "react";
import DynamicNavBar from "../components/DynamicNavBar";
import "../admin_dashboard/admin.css";

export default function AdminViewBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await fetch("/api/bookings");
        const data = await response.json();

        if (data.success) {
          setBookings(data.bookings);
        } else {
          setMessage(data.message || "Could not load bookings");
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
          <h1 className="admin-title">View All Bookings</h1>
          <p className="admin-subtitle">
            Display all StagePass bookings from the database.
          </p>
        </section>

        {message && <p className="login-message">{message}</p>}

        <section className="admin-card">
          {bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>User</th>
                  <th>Event</th>
                  <th>Tickets</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.BookingId}>
                    <td>{booking.BookingId}</td>
                    <td>
                      {booking.FirstName} {booking.LastName}
                    </td>
                    <td>{booking.Title}</td>
                    <td>{booking.NumberOfTickets}</td>
                    <td>€{booking.TotalPrice}</td>
                    <td>{booking.Status}</td>
                    <td>{booking.BookingDate}</td>
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