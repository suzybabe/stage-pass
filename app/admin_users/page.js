import Link from "next/link";
import DynamicNavBar from "../components/DynamicNavBar";
import "../admin_dashboard/admin.css";

export default function AdminUsersPage() {
  return (
    <>
      <DynamicNavBar />

      <main className="admin-container">
        <section className="admin-header">
          <h1 className="admin-title">Manage Users</h1>

          <p className="admin-subtitle">
            Create, view, update, or delete StagePass users.
          </p>
        </section>

        <section className="admin-grid">
          <Link href="/admin_create_user" className="admin-card">
            <h2>Create User</h2>
            <p>Add a new admin, organiser, or attendee account.</p>
          </Link>

          <Link href="/admin_view_users" className="admin-card">
            <h2>View All Users</h2>
            <p>Display registered users from the database.</p>
          </Link>

          <Link href="/admin_update_user" className="admin-card">
            <h2>Update User</h2>
            <p>Edit user account details and roles.</p>
          </Link>

          <Link href="/admin_delete_user" className="admin-card">
            <h2>Delete User</h2>
            <p>Remove user accounts from the system.</p>
          </Link>
        </section>
      </main>
    </>
  );
}