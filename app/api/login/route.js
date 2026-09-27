import pool from "../libs/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { createSessionToken, SESSION_COOKIE_OPTIONS } from "../libs/authen";

export async function POST(request) {
  try {
    const body = await request.json();

    // Check email and password provided
    if (!body.Email || !body.Password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Find user by email
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE Email = ?",
      [body.Email]
    );

    // User not found
    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Compare hashed password
    const passwordMatch = await bcrypt.compare(
      body.Password,
      user.Password
    );

    // Wrong password
    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        UserId: user.UserId,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email,
        Role: user.Role,
      },
    });

    // Create signed session cookie
    response.cookies.set(
      "session",
      createSessionToken(user.UserId),
      SESSION_COOKIE_OPTIONS
    );

    return response;

  } catch (err) {
    console.error("POST /api/login error:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Login failed",
      },
      { status: 500 }
    );
  }
}