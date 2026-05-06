import db from "../libs/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT 1");

    return Response.json({
      success: true,
      rows,
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}