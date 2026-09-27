import { NextResponse } from "next/server";
import { SESSION_COOKIE_OPTIONS } from "../libs/authen";

// POST - Log out by clearing the session cookie
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out",
  });

  response.cookies.set("session", "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 });

  return response;
}
