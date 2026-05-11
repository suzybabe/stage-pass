import Link from "next/link";
import DynamicNavBar from "../components/DynamicNavBar";
import "../admin_dashboard/admin.css";

export default function AttendeeDashboardPage() {
  return (
    <>
      <DynamicNavBar />

      <main className="admin-container">
        <section className="admin-header">
          <h1 className="admin-title">Attendee Dashboard</h1>
          <p className="admin-subtitle">
            Browse events, book tickets, and view your bookings.
          </p>
        </section>

        <section className="admin-grid">
          <Link href="/events_page" className="admin-card">
            <h2>Browse Events</h2>
            <p>View available concerts, festivals, and live events.</p>
          </Link>

          <Link href="/booking_page" className="admin-card">
            <h2>Book Tickets</h2>
            <p>Reserve tickets for an upcoming event.</p>
          </Link>

          <Link href="/my_bookings" className="admin-card">
            <h2>My Bookings</h2>
            <p>View or manage your event bookings.</p>
          </Link>
        </section>
      </main>
    </>
  );
}