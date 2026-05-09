"use client";
import { useState } from "react";
import "./booking.css";
import "../events_page/events.css"; /*importing nice card style from events_page to show same card style after booking */
import EventCard from "../components/EventCard";

export default function BookingPage() {
  const [formData, setFormData] = useState({
    UserId: "",
    EventId: "",
    NumberOfTickets: "",
  });

  const [message, setMessage] = useState("");

  //Store booking details returned from API 
  //Used to render resuable EventCard after successful booking
  const [booking, setBooking] = useState(null);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setBooking(null);   //clears the old booking when user starts typing again
    setMessage("");     //message disappears 
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

        //If backend returned existing booking,
        //store it so the booking card can still display
        if(data.booking){
          setBooking(data.booking); //save successful booking which triggers EventCard to render
        }

        setMessage(data.message || "Something went wrong");
        return;
      }

      setMessage("Booking confirmed! Booking ID: " + data.booking.BookingId);
      setFormData({ UserId: "", EventId: "", NumberOfTickets: "" });
      setBooking(data.booking);

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

       {/*Reusable event card component used to display booking confirmation or existing booking details */}
       {booking && (
         <div className="events-grid">
          <EventCard event={booking} bookingMode={true} /> 
        </div>
       )}

        <footer className="booking-footer">
          © 2026 StagePass — Event Booking Portal
        </footer>

      </main>
    </>
  );
}
