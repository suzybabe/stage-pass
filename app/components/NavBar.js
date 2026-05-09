"use client";

import Link from "next/link";
import "./navbar.css";

export default function NavBar() {

  // Temporary role until login/authentication is connected
  const userRole = "admin";

  return (
    <nav className="navbar">

      <h1 className="logo">StagePass</h1>

      <div className="nav-links">

        <Link href="/">Home</Link>

        {/* Admin navigation */}
        {userRole === "admin" && (
          <>
            <Link href="/admin_users">Manage Users</Link>
            <Link href="/admin_bookings">All Bookings</Link>
            <Link href="/events_page">All Events</Link>
          </>
        )}

        {/* Organiser navigation */}
        {userRole === "organiser" && (
          <>
            <Link href="/create_event">Create Event</Link>
            <Link href="/my_events">My Events</Link>
            <Link href="/events_page">View Events</Link>
          </>
        )}

        {/* Attendee navigation */}
        {userRole === "attendee" && (
          <>
            <Link href="/events_page">View Events</Link>
            <Link href="/booking_page">Book Tickets</Link>
            <Link href="/my_bookings">My Bookings</Link>
          </>
        )}

      </div>
    </nav>
  );
}