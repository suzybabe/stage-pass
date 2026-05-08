import pool from "../libs/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt"; 

// Validation regex patterns
const USERID_REGEX = /^\d+$/;
const NAME_REGEX = /^[a-zA-Z]{2,50}$/;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const MOBILE_REGEX = /^\d{10}$/;
// IMPROVED PASSWORD REGEX - requires uppercase, lowercase, number, special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const VALID_ROLES = ["organiser", "attendee", "admin"];

// Check if email already exists in database (used for both create and update)
async function emailExists(email, excludeUserId = null) {
  let query = "SELECT UserId FROM Users WHERE Email = ?";
  let params = [email];
  
  if (excludeUserId) {
    query += " AND UserId != ?";
    params.push(excludeUserId);
  }
  
  const [rows] = await pool.execute(query, params);
  return rows.length > 0;
}

// Validate user data before saving to database
function validateUser(data, isUpdate = false) {
  const errors = {};

  if (!isUpdate || data.FirstName !== undefined) {
    if (!data.FirstName || !NAME_REGEX.test(data.FirstName))
      errors.FirstName = "First name must be 2-50 letters only";
  }

  if (!isUpdate || data.LastName !== undefined) {
    if (!data.LastName || !NAME_REGEX.test(data.LastName))
      errors.LastName = "Last name must be 2-50 letters only";
  }

  if (!isUpdate || data.Email !== undefined) {
    if (!data.Email || !EMAIL_REGEX.test(data.Email))
      errors.Email = "Please enter a valid email address";
  }

  if (!isUpdate || data.Mobile !== undefined) {
    if (!data.Mobile || !MOBILE_REGEX.test(data.Mobile))
      errors.Mobile = "Mobile must be 10 digits";
  }

  if (!isUpdate || data.Password !== undefined) {
    if (!data.Password || !PASSWORD_REGEX.test(data.Password))
      errors.Password = "Password must be at least 8 characters with uppercase, lowercase, number, and special character";
  }

  if (!isUpdate || data.Role !== undefined) {
    if (!data.Role || !VALID_ROLES.includes(data.Role))
      errors.Role = "Role must be organiser, attendee or admin";
  }

  return errors;
}

// GET users - can filter by userId, otherwise returns all users with pagination
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;

  try {
    // Get a specific user by userId
    if (userId) {
      if (!USERID_REGEX.test(userId)) {
        return NextResponse.json(
          { success: false, message: "Invalid userId format" },
          { status: 400 }
        );
      }

      const [rows] = await pool.execute(
        `SELECT
           u.UserId,
           u.FirstName,
           u.LastName,
           u.Email,
           u.Mobile,
           u.Role,
           u.Status,
           u.CreatedAt
         FROM Users u
         WHERE u.UserId = ? AND u.Status = 'active'`,
        [userId]
      );

      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user: rows[0],
      });
    }

    // Get ALL users with pagination
    const [rows] = await pool.execute(
      `SELECT
         u.UserId,
         u.FirstName,
         u.LastName,
         u.Email,
         u.Mobile,
         u.Role,
         u.Status,
         u.CreatedAt
       FROM Users u
       WHERE u.Status = 'active'
       ORDER BY u.LastName ASC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    
    // Get total count for pagination
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM Users WHERE Status = 'active'`
    );
    const total = countResult[0].total;

    return NextResponse.json({
      success: true,
      users: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error("Users fetch error:", err);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request) {
  try {
    // ADD REQUEST SIZE LIMIT CHECK
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10240) {
      return NextResponse.json(
        { success: false, message: "Request too large" },
        { status: 413 }
      );
    }

    const body = await request.json();

    // Run validation
    const errors = validateUser(body, false);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors, values: body },
        { status: 400 }
      );
    }

    // Check if email already exists
    const emailExists_check = await emailExists(body.Email); // RENAMED to avoid conflict
    if (emailExists_check) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // HASH PASSWORD BEFORE SAVING
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(body.Password, saltRounds);

    // Insert new user into database with hashed password
    const [insertResult] = await pool.execute(
      `INSERT INTO Users (FirstName, LastName, Email, Mobile, Password, Role, Status, CreatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [
        body.FirstName,
        body.LastName,
        body.Email,
        body.Mobile,
        hashedPassword, // USE HASHED PASSWORD
        body.Role,
      ]
    );

    const newUser = {
      userId: insertResult.insertId,
      firstName: body.FirstName,
      lastName: body.LastName,
      email: body.Email,
      mobile: body.Mobile,
      role: body.Role,
      status: 'active'
    };

    return NextResponse.json(
      { success: true, user: newUser },
      { status: 201 }
    );

  } catch (err) {
    console.error("POST /api/users error:", err);
    // HANDLE DUPLICATE ENTRY ERROR (e.g. email uniqueness)
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, message: "Duplicate entry - email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, errors: { general: "Something went wrong. Please try again." } },
      { status: 500 }
    );
  }
}

// PUT - update user details
export async function PUT(request) {
  try {
    const body = await request.json();

    // userId is required to know which user to update
    if (!body.UserId || !USERID_REGEX.test(body.UserId)) {
      return NextResponse.json(
        { success: false, message: "Valid userId is required" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check user exists in database
      const [userRows] = await connection.execute(
        "SELECT UserId, Email FROM Users WHERE UserId = ? AND Status = 'active'",
        [body.UserId]
      );

      if (userRows.length === 0) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      // If email is being updated, check if new email already exists for another user
      if (body.Email && body.Email !== userRows[0].Email) {
        const emailExists_check = await emailExists(body.Email, body.UserId);
        if (emailExists_check) {
          await connection.rollback();
          connection.release();
          return NextResponse.json(
            { success: false, message: "Email already in use by another account" },
            { status: 409 }
          );
        }
      }

      const updates = [];
      const values = [];

      // Handle regular fields
      if (body.FirstName !== undefined) {
        if (!NAME_REGEX.test(body.FirstName)) {
          await connection.rollback();
          connection.release();
          return NextResponse.json(
            { success: false, message: "Invalid first name format" },
            { status: 400 }
          );
        }
        updates.push("FirstName = ?");
        values.push(body.FirstName);
      }

      if (body.LastName !== undefined) {
        if (!NAME_REGEX.test(body.LastName)) {
          await connection.rollback();
          connection.release();
          return NextResponse.json(
            { success: false, message: "Invalid last name format" },
            { status: 400 }
          );
        }
        updates.push("LastName = ?");
        values.push(body.LastName);
      }

      if (body.Email !== undefined) {
        if (!EMAIL_REGEX.test(body.Email)) {
          await connection.rollback();
          connection.release();
          return NextResponse.json(
            { success: false, message: "Invalid email format" },
            { status: 400 }
          );
        }
        updates.push("Email = ?");
        values.push(body.Email);
      }

      if (body.Mobile !== undefined) {
        if (!MOBILE_REGEX.test(body.Mobile)) {
          await connection.rollback();
          connection.release();
          return NextResponse.json(
            { success: false, message: "Invalid mobile format" },
            { status: 400 }
          );
        }
        updates.push("Mobile = ?");
        values.push(body.Mobile);
      }

      if (body.Role !== undefined) {
        if (!VALID_ROLES.includes(body.Role)) {
          await connection.rollback();
          connection.release();
          return NextResponse.json(
            { success: false, message: "Invalid role" },
            { status: 400 }
          );
        }
        updates.push("Role = ?");
        values.push(body.Role);
      }

      // Handle password update separately with hashing
      if (body.Password !== undefined) {
        if (!PASSWORD_REGEX.test(body.Password)) {
          await connection.rollback();
          connection.release();
          return NextResponse.json(
            { success: false, message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character" },
            { status: 400 }
          );
        }
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(body.Password, saltRounds);
        updates.push("Password = ?");
        values.push(hashedPassword); // USE HASHED PASSWORD
      }

      // Always update UpdatedAt timestamp
      updates.push("UpdatedAt = NOW()");

      // WHERE clause value
      values.push(body.UserId);

      // Only run update if there are fields to update
      if (updates.length > 1) { // more than just UpdatedAt
        await connection.execute(
          `UPDATE Users SET ${updates.join(", ")} WHERE UserId = ?`,
          values
        );
      }

      await connection.commit();
      connection.release();

      return NextResponse.json({
        success: true,
        message: "User updated successfully",
      });

    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }

  } catch (err) {
    console.error("PUT /api/users error:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, message: "Duplicate entry - email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 500 }
    );
  }
}

// DELETE - soft delete user (CHANGED from hard delete)
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  // Validate userId
  if (!userId || !USERID_REGEX.test(userId)) {
    return NextResponse.json(
      { success: false, message: "Valid userId is required" },
      { status: 400 }
    );
  }

  try {
    // Check user exists and is active
    const [rows] = await pool.execute(
      "SELECT UserId, Status FROM Users WHERE UserId = ?",
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (rows[0].Status === "inactive") {
      return NextResponse.json(
        { success: false, message: "User is already inactive" },
        { status: 409 }
      );
    }

    // Soft delete the user by setting status to 'inactive' and recording deletion time
    await pool.execute(
      "UPDATE Users SET Status = 'inactive', DeletedAt = NOW() WHERE UserId = ?",
      [userId]
    );

    return NextResponse.json({
      success: true,
      message: "User deactivated successfully",
    });

  } catch (err) {
    console.error("DELETE /api/users error:", err);
    return NextResponse.json(
      { success: false, message: "Deactivation failed" },
      { status: 500 }
    );
  }
}