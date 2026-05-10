import Link from "next/link";
import DynamicNavBar from "../components/DynamicNavBar";
import "../admin_dashboard/admin.css";

export default function OrganiserDashboardPage() {
  return (
    <>
      <DynamicNavBar />

      <main className="admin-container">
        <section className="admin-header">
          <h1 className="admin-title">Organiser Dashboard</h1>
          <p className="admin-subtitle">
            Create events, manage your events, and view bookings.
          </p>
        </section>

        <section className="admin-grid">
          <Link href="/create_event" className="admin-card">
            <h2>Create Event</h2>
            <p>Add a new event to StagePass.</p>
          </Link>

          <Link href="/my_events" className="admin-card">
            <h2>My Events</h2>
            <p>View, update, or delete your own events.</p>
          </Link>

          <Link href="/organiser_bookings" className="admin-card">
            <h2>Event Bookings</h2>
            <p>View bookings for your events.</p>
          </Link>
        </section>
      </main>
    </>
  );
}