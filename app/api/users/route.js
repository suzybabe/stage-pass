import pool from "../libs/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getUserFromSession, hasRole, isSameUser } from "../libs/authen";

// Validation regex patterns
const USERID_REGEX = /^\d+$/;
const NAME_REGEX = /^[a-zA-Z]{2,50}$/;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const MOBILE_REGEX = /^\d{10}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const VALID_ROLES = ["organiser", "attendee", "admin"];

// Check if email already exists in database
async function emailExists(email, excludeUserId = null) {
  let query = "SELECT UserId FROM users WHERE Email = ?";
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
      errors.Password = "Password must be at least 8 characters with uppercase, lowercase, number and special character";
  }

  if (!isUpdate || data.Role !== undefined) {
    if (!data.Role || !VALID_ROLES.includes(data.Role))
      errors.Role = "Role must be organiser, attendee or admin";
  }

  return errors;
}

// GET - Fetch users
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;    //Calculate SQL offset for pagination

  try {
    const user = await getUserFromSession(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "You must be logged in" },
        { status: 401 }
      );
    }

    // Get a specific user by userId
    if (userId) {
      if (!USERID_REGEX.test(userId)) {
        return NextResponse.json(
          { success: false, message: "Invalid userId format" },
          { status: 400 }
        );
      }

      // Users can only view their own details, admins can view anyone
      if (!hasRole(user, ["admin"]) && !isSameUser(user, userId)) {
        return NextResponse.json(
          { success: false, message: "Access denied" },
          { status: 403 }
        );
      }

      const [rows] = await pool.execute(
        `SELECT
           u.UserId,
           u.FirstName,
           u.LastName,
           u.Email,
           u.Mobile,
           u.Role
         FROM users u
         WHERE u.UserId = ?`,
        [userId]
      );

      //Check if no user exists 
      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      //Return single user object
      return NextResponse.json({
        success: true,
        user: rows[0],
      });
    }

    // Only admins can view the full user list
    if (!hasRole(user, ["admin"])) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    //Covert values into safe numbers
    const safeLimit = Math.max(1, Number(limit));
    const safeOffset = Math.max(0, Number(offset));

    //Get ALL users with pagination
    const [rows] = await pool.execute(
      `SELECT
         u.UserId,
         u.FirstName,
         u.LastName,
         u.Email,
         u.Mobile,
         u.Role
       FROM users u
       ORDER BY u.LastName ASC
       LIMIT ${safeLimit} OFFSET ${safeOffset}`
    );

    //Get total count for pagination
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM users`
    );

    //Store total count
    const total = countResult[0].total;

    //Return users and pagination data 
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
  // Limit request body size to prevent abuse
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 10240) {
    return NextResponse.json(
      { success: false, message: "Request too large" },
      { status: 413 }
    );
  }

  try {
    const body = await request.json();

    // Run validation
    const errors = validateUser(body, false);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors, values: body },
        { status: 400 }
      );
    }

    // Only an admin can create another admin account
    if (body.Role === "admin") {
      const user = await getUserFromSession(request);

      if (!hasRole(user, ["admin"])) {
        return NextResponse.json(
          { success: false, message: "Only an admin can create admin accounts" },
          { status: 403 }
        );
      }
    }

    // Check if email already exists
    const emailTaken = await emailExists(body.Email);
    if (emailTaken) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(body.Password, saltRounds);

    // Insert new user into database
    const [insertResult] = await pool.execute(
      `INSERT INTO users (FirstName, LastName, Email, Mobile, Password, Role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        body.FirstName,
        body.LastName,
        body.Email,
        body.Mobile,
        hashedPassword,
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
    };

    return NextResponse.json(
      { success: true, user: newUser },
      { status: 201 }
    );

  } catch (err) {
    console.error("POST /api/users error:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, errors: { general: "Something went wrong. Please try again." } },
      { status: 500 }
    );
  }
}

// PUT - Update user details
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

    const user = await getUserFromSession(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "You must be logged in" },
        { status: 401 }
      );
    }

    // Users can only update themselves, admins can update anyone
    if (!hasRole(user, ["admin"]) && !isSameUser(user, body.UserId)) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // Only admins can change a role
    if (!hasRole(user, ["admin"]) && body.Role !== undefined && body.Role !== user.Role) {
      return NextResponse.json(
        { success: false, message: "Only an admin can change roles" },
        { status: 403 }
      );
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check user exists in database
      const [userRows] = await connection.execute(
        "SELECT UserId, Email FROM users WHERE UserId = ?",
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

      // Check if new email already exists for another user
      if (body.Email && body.Email !== userRows[0].Email) {
        const emailTaken = await emailExists(body.Email, body.UserId);
        if (emailTaken) {
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

      // Update first name if provided
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

      // Update last name if provided
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

      // Update email if provided
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

      // Update mobile if provided
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

      // Update role if provided
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

      // Hash and update password if provided
      if (body.Password !== undefined) {
        if (!PASSWORD_REGEX.test(body.Password)) {
          await connection.rollback();
          connection.release();
          return NextResponse.json(
            { success: false, message: "Password must be at least 8 characters with uppercase, lowercase, number and special character" },
            { status: 400 }
          );
        }
        const hashedPassword = await bcrypt.hash(body.Password, 10);
        updates.push("Password = ?");
        values.push(hashedPassword);
      }

      // Add userId for WHERE clause
      values.push(body.UserId);

      if (updates.length > 0) {
        await connection.execute(
          `UPDATE users SET ${updates.join(", ")} WHERE UserId = ?`,
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
        { success: false, message: "Email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 500 }
    );
  }
}

// DELETE - Remove user
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

    const user = await getUserFromSession(request);

   if (!hasRole(user, ["admin"])) {
  return NextResponse.json(
    {
      success: false,
      message: "Admin access required",
    },
    { status: 403 }
  );
}
    // Check user exists before deleting
    const [rows] = await pool.execute(
      "SELECT UserId FROM users WHERE UserId = ?",
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Delete the user
    await pool.execute(
      "DELETE FROM users WHERE UserId = ?",
      [userId]
    );

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (err) {
  console.error("DELETE /api/users error:", err);

    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return NextResponse.json(
        {
          success: false,
          message: "This user cannot be deleted because they have existing bookings.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Deletion failed" },
      { status: 500 }
    );
  }
}