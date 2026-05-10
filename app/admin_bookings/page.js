import Link from "next/link";
import DynamicNavBar from "../components/DynamicNavBar";
import "../admin_dashboard/admin.css";

export default function AdminBookingsPage() {
  return (
    <>
      <DynamicNavBar />

      <main className="admin-container">
        <section className="admin-header">
          <h1 className="admin-title">Manage Bookings</h1>
          <p className="admin-subtitle">
            View or cancel StagePass bookings.
          </p>
        </section>

        <section className="admin-grid">
          <Link href="/admin_view_bookings" className="admin-card">
            <h2>View All Bookings</h2>
            <p>Display all bookings from the database.</p>
          </Link>

          <Link href="/admin_delete_booking" className="admin-card">
            <h2>Cancel Booking</h2>
            <p>Cancel a booking by booking ID.</p>
          </Link>
        </section>
      </main>
    </>
  );
}