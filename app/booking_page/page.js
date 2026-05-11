"use client";
import { useState } from "react";
import "./booking.css";
import "../signin_page/signup.css";
import "../events_page/events.css"; /*importing nice card style from events_page to show same card style after booking */
import DynamicNavBar from "../components/DynamicNavBar";

//reusable component used to display booking/event details
import EventCard from "../components/EventCard";

export default function BookingPage() {

  //Stores all form input values 
  const [formData, setFormData] = useState({
    UserId: "",
    EventId: "",
    NumberOfTickets: "",
  });

  //General success/error message
  const [message, setMessage] = useState("");

  //Stores field-specific validation errors (e.g "No user found " "invalid event id ")
  const [errors, setErrors] = useState({});

  //Stores booking details returned from API 
  //Used to render resuable EventCard after successful booking
  const [booking, setBooking] = useState(null);

  //Runs whenever user types into an input 
  function handleChange(e) {

    //Update the specific field in formData
    setFormData({ ...formData, [e.target.name]: e.target.value });

    //Clears validation error for the field being edited 
    setErrors({
      ...errors,
      [e.target.name]: "",
    });

    setBooking(null);   //clears the old booking when user starts typing again
    setMessage("");     //message disappears 
  }

  //Handle form submission
  async function handleSubmit(e) {

    //Prevent page refresh
    e.preventDefault();
    setMessage("");

    try {

      //Send booking data to the backend API 
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      //Convert API response into JavaScript object
      const data = await res.json();

      //If backend returned an error
      if (!res.ok) {

        //If backend returned existing booking,
        //store it so the booking card can still display
        if(data.booking){
          setBooking(data.booking); //save successful booking which triggers EventCard to render
        }

        //Backend validation errors object (e.g. "number of tickets must be at least 1")
        if(data.errors) {
          setErrors(data.errors);   //store validation errors in the state

        //Single field-specific error 
        }else if (data.field) {
          setErrors({ [data.field]: data.message }); //create matching error properties (e.g. EventID: "No event found with that ID")

        //general fallback error
        }else{
          setMessage(data.message || "Something went wrong");
        }

        return;
      }

      //Success booking message
      setMessage("Booking confirmed! Booking ID: " + data.booking.BookingId);

      //Reset after booking
      setFormData({ UserId: "", EventId: "", NumberOfTickets: "" });

      //Save booking returned from backend (renders Event card)
      setBooking(data.booking);

    } catch (err) {
      setMessage("Something went wrong.");
    }
  }

  return (
    <>
      <DynamicNavBar />
      <main className="booking-container">

        <section className="booking-header">
          <h1 className="booking-title">Book Your Tickets</h1>
          <p className="booking-subtitle">
            Enter your details below and secure your spot.
          </p>
        </section>

        {/*Booking form */}
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

            {/*Inline validation error */}
            {errors.UserId && <p className="field-error">{errors.UserId}</p>}
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

            {/*Inline validation error */}
            {errors.EventId && <p className="field-error">{errors.EventId}</p>}
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

            {/*Inline validation error */}
            {errors.NumberOfTickets && (
               <p className="field-error">{errors.NumberOfTickets}</p>
            )}
          </label>

          <button type="submit" className="submit-button">
            Submit Booking
          </button>

        </form>

        {/*General message display */}
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
