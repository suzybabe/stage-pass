import pool from "../libs/db";
export async function GET() {
  try {
    const [rows] = await pool.execute("SELECT 1");

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