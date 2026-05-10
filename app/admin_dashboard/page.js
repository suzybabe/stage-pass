import Link from "next/link";
import DynamicNavBar from "../components/DynamicNavBar";
import "./admin.css";

export default function AdminUsersPage() {
  return (
    <>
      <DynamicNavBar />

      <main className="admin-container">
        <section className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">
            Manage users, events, and bookings from one place.
          </p>
        </section>

        <section className="admin-grid">
          <Link href="/admin_users" className="admin-card">
            <h2>Manage Users</h2>
            <p>Create, view, update, or delete user accounts.</p>
          </Link>

          <Link href="/admin_events" className="admin-card">
            <h2>Manage Events</h2>
            <p>Create, view, update or delete events.</p>
          </Link>

          <Link href="/admin_bookings" className="admin-card">
            <h2>Manage Bookings</h2>
            <p>View, update or delete bookings.</p>
          </Link>

          <Link href="/admin_overview" className="admin-card">
            <h2>System Overview</h2>
            <p>See totals for users, events, and bookings.</p>
          </Link>
        </section>
      </main>
    </>
  );
}