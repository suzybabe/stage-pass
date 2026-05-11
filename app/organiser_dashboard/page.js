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

          <Link href="/events_page" className="admin-card">
            <h2>Events</h2>
            <p>View your own event.</p>
          </Link>

          <Link href="/admin_bookings" className="admin-card">
            <h2>Bookings</h2>
            <p>View bookings for your events.</p>
          </Link>
        </section>
      </main>
    </>
  );
}