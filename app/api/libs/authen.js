import crypto from "crypto";
import pool from "./db";

const SESSION_MAX_AGE = 60 * 60 * 24; // 1 day (seconds)

// Cookie settings shared by login and logout
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: SESSION_MAX_AGE,
  path: "/",
};

// Secret used to sign session cookies (set SESSION_SECRET in .env.local)
function getSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET is missing from .env.local");
  }

  return secret;
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

// Create a signed session token in the format "userId.expires.signature"
// so a user cannot just change the cookie to another user's ID
export function createSessionToken(userId) {
  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${userId}.${expires}`;

  return `${payload}.${sign(payload)}`;
}

// Check the signature and expiry, return the userId if valid
function verifySessionToken(token) {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [userId, expires, signature] = parts;
  const expected = sign(`${userId}.${expires}`);

  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }

  if (Date.now() > Number(expires)) {
    return null;
  }

  return userId;
}

// Get logged in user from cookie
export async function getUserFromSession(request) {
  try {
    const session = request.cookies.get("session");

    if (!session) {
      return null;
    }

    const userId = verifySessionToken(session.value);

    if (!userId) {
      return null;
    }

    const [rows] = await pool.execute(
      `SELECT UserId, FirstName, LastName, Email, Role
       FROM users
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

// Check if the logged in user is the given user
export function isSameUser(user, userId) {
  if (!user) return false;

  return String(user.UserId) === String(userId);
}
