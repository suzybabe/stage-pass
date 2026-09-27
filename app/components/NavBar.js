"use client";

import Link from "next/link";
import "./navbar.css";

export default function NavBar({ role }) {

  const navLinks = {
    admin: [
     { name: "Dashboard", href: "/admin_dashboard" },
     { name: "Users", href: "/admin_users" },
     { name: "Events", href: "/admin_events" },
     { name: "Bookings", href: "/admin_bookings" },
    ],

    organiser: [
     { name: "Dashboard", href: "/organiser_dashboard" },
     { name: "Create Event", href: "/create_event" },
     { name: "My Events", href: "/my_events" },
     { name: "Bookings", href: "/organiser_bookings" },
    ],

    attendee: [
     { name: "Dashboard", href: "/attendee_dashboard" },
     { name: "Events", href: "/events_page" },
     { name: "My Bookings", href: "/my_bookings" },
    ],

    home: [
        { name: "Home", href: "/" }
    ]
  };

    if (!role) {
    return null;
  }

  // Clear the session cookie and go back to the home page
  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <nav className="navbar">

    {/*//made to be able to always return to home where ever the user currently is */}
        <Link href="/" className="logo">   
            StagePass
        </Link>

      <div className="nav-links">

        {navLinks[role]?.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.name}
          </Link>
        ))}

        {/* Logged in users get a log out button, visitors get log in / sign up */}
        {role === "home" ? (
          <>
            <Link href="/login_page">Log In</Link>
            <Link href="/signin_page">Sign Up</Link>
          </>
        ) : (
          <button type="button" onClick={handleLogout}>
            Log Out
          </button>
        )}

      </div>
    </nav>
  );
}