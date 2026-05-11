import { NextResponse } from "next/server";
import { getUserFromSession } from "../libs/authen";

export async function GET(request) {
  try {
    const user = await getUserFromSession(request);

    if (!user) {
      return NextResponse.json({
        success: false,
        user: null,
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        UserId: user.UserId,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email,
        Role: user.Role,
      },
    });

  } catch (err) {
    console.error("GET /api/me error:", err);

    return NextResponse.json({
      success: false,
      user: null,
    });
  }
}