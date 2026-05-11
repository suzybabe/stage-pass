"use client";

import { useState } from "react";
import DynamicNavBar from "./DynamicNavBar";

export default function EventForm() {
  const [formData, setFormData] = useState({
    Title: "",
    Description: "",
    Location: "",
    EventDate: "",
    EventTime: "",
    Capacity: "",
    Price: "",
    EventType: "Concert",
    OrganiserId: "",
  });

  //Stores success/error messages shown to the user
  const [message, setMessage] = useState("");

  //Updates form state whenever user types into an input field
  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  //Handles event form submission
  async function createEvent(e) {
    e.preventDefault();

    try {

      //Sends POST request to backend API
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      //Successful event creation
      if (data.success) {
        setMessage("Event created successfully!");

        //Reset form fields after successful submission
        setFormData({
          Title: "",
          Description: "",
          Location: "",
          EventDate: "",
          EventTime: "",
          Capacity: "",
          Price: "",
          EventType: "Concert",
          OrganiserId: "",
        });
      } else {

        //Display validation errors returned from API
        if (data.errors) {
          setMessage(Object.values(data.errors).join(" | "));
        } else {
          setMessage(data.message || "Could not create event");
        }
      }
    } catch (error) {

      //Handles unexpected server/network errors
      console.error(error);
      setMessage("Something went wrong while creating event");
    }
  }

  return (
    <>
    
      {/* Event creation form */}
      <form className="login-form" onSubmit={createEvent}>

        {/*Event title input */}
        <label>
          Title
          <input
            type="text"
            name="Title"
            className="input"
            value={formData.Title}
            onChange={handleChange}
            required
          />
        </label>

        {/*Event description input */}
        <label>
          Description
          <input
            type="text"
            name="Description"
            className="input"
            value={formData.Description}
            onChange={handleChange}
            required
          />
        </label>

        {/* Event location input */}
        <label>
          Location
          <input
            type="text"
            name="Location"
            className="input"
            value={formData.Location}
            onChange={handleChange}
            required
          />
        </label>

        {/*Event date input */}
        <label>
          Event Date
          <input
            type="date"
            name="EventDate"
            className="input"
            value={formData.EventDate}
            onChange={handleChange}
            required
          />
        </label>

        {/*Event time input */}
        <label>
          Event Time
          <input
            type="time"
            name="EventTime"
            className="input"
            value={formData.EventTime}
            onChange={handleChange}
            required
          />
        </label>

        {/*Event capacity input */}
        <label>
          Capacity
          <input
            type="number"
            name="Capacity"
            className="input"
            value={formData.Capacity}
            onChange={handleChange}
            required
          />
        </label>

        {/*Event price input */}
        <label>
          Price
          <input
            type="number"
            step="0.01"
            name="Price"
            className="input"
            value={formData.Price}
            onChange={handleChange}
            required
          />
        </label>

        {/*Dropdown selection for event category */}
        <label>
          Event Type
          <select
            name="EventType"
            className="input"
            value={formData.EventType}
            onChange={handleChange}
          >
            <option value="Concert">Concert</option>
            <option value="Workshop">Workshop</option>
            <option value="Festival">Festival</option>
            <option value="Theatre">Theatre</option>
            <option value="Comedy">Comedy</option>
            <option value="Sports">Sports</option>
          </select>
        </label>

        <label>
          Organiser ID
          <input
            type="text"
            name="OrganiserId"
            className="input"
            value={formData.OrganiserId}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" className="submit-button">
          Create Event
        </button>
      </form>

      {message && <p className="login-message">{message}</p>}
    </>
  );
}