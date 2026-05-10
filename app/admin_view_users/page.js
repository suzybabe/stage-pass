"use client";

import { useEffect, useState } from "react";
import DynamicNavBar from "../components/DynamicNavBar";
import "../admin_dashboard/admin.css";

export default function AdminViewUsersPage() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();

        if (data.success) {
          setUsers(data.users);
        } else {
          setMessage(data.message || "Could not load users");
        }
      } catch (error) {
        console.error(error);
        setMessage("Something went wrong while loading users");
      }
    }

    fetchUsers();
  }, []);

  return (
    <>
      <DynamicNavBar />

      <main className="admin-container">
        <section className="admin-header">
          <h1 className="admin-title">View All Users</h1>
          <p className="admin-subtitle">
            Display all registered StagePass users.
          </p>
        </section>

        {message && <p className="login-message">{message}</p>}

        <section className="admin-card">
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Role</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.UserId}>
                    <td>{user.UserId}</td>
                    <td>
                      {user.FirstName} {user.LastName}
                    </td>
                    <td>{user.Email}</td>
                    <td>{user.Mobile}</td>
                    <td>{user.Role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </>
  );
}