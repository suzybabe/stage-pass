import Link from "next/link";
import DynamicNavBar from "../components/DynamicNavBar";
import "../admin_dashboard/admin.css";

export default function AdminEventsPage() {
  return (
    <>
      <DynamicNavBar />

      <main className="admin-container">
        <section className="admin-header">
          <h1 className="admin-title">Manage Events</h1>
          <p className="admin-subtitle">
            Create, view, update, or delete StagePass events.
          </p>
        </section>

        <section className="admin-grid">
          <Link href="/create_event" className="admin-card">
            <h2>Create Event</h2>
            <p>Add a new event to StagePass.</p>
          </Link>

          <Link href="/admin_view_events" className="admin-card">
            <h2>View All Events</h2>
            <p>Display all events from the database.</p>
          </Link>

          <Link href="/admin_update_event" className="admin-card">
            <h2>Update Event</h2>
            <p>Edit event details.</p>
          </Link>

          <Link href="/admin_delete_event" className="admin-card">
            <h2>Delete Event</h2>
            <p>Remove an event from the system.</p>
          </Link>
        </section>
      </main>
    </>
  );
}