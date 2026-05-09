import pool from "./db";

// Get logged in user from cookie
export async function getUserFromSession(request) {
  try {
    const session = request.cookies.get("session");

    if (!session) {
      return null;
    }

    const userId = session.value;

    const [rows] = await pool.execute(
      `SELECT UserId, FirstName, LastName, Email, Role
       FROM Users
       WHERE UserId = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];

  } catch (err) {
    console.error(err);
    return null;
  }
}

// Check role permissions
export function hasRole(user, allowedRoles) {
  if (!user) return false;

  return allowedRoles.includes(user.Role);
}