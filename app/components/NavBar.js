"use client";

import Link from "next/link";
import "./navbar.css";

export default function NavBar({ role }) {

  //Different navlinks for user -based roles
  const navLinks = {

    //Admin navigation menu
    admin: [
     { name: "Dashboard", href: "/admin_dashboard" },
     { name: "Users", href: "/admin_users" },
     { name: "Events", href: "/admin_events" },
     { name: "Bookings", href: "/admin_bookings" },
    ],

    //Organiser navigation menu
    organiser: [
     { name: "Dashboard", href: "/organiser_dashboard" },
     { name: "Create Event", href: "/create_event" },
     { name: "Events", href: "/events_page" },
     { name: "Bookings", href: "/admin_bookings" },
    ],

    //Attendee navigation menu
    attendee: [
     { name: "Dashboard", href: "/attendee_dashboard" },
     { name: "Events", href: "/events_page" },
     { name: "My Bookings", href: "/my_bookings" },
    ],

    //Default navigation menu for users not logged in
    home: [
        { name: "Home", href: "/" }
    ]
  };

    //Prevent navbar rendering until role has been loaded
    if (!role) {
    return null;
  }

  return (
    <nav className="navbar">

    {/*//made to be able to always return to home where ever the user currently is */}
        <Link href="/" className="logo">   
            StagePass
        </Link>

      <div className="nav-links">

        {/*Dynamically render links based on current user role */}
        {navLinks[role]?.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.name}
          </Link>
        ))}

      </div>
    </nav>
  );
}