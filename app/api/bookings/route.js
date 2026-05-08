import pool from "../../libs/db";
import { NextResponse } from "next/server";

// Validation regex patterns
const BOOKINGID_REGEX = /^\d+$/;
const USERID_REGEX = /^\d+$/;
const EVENTID_REGEX = /^\d+$/;
const TICKETS_REGEX = /^\d+$/;

// Validate booking data before saving to database
function validateBooking(data) {
  const errors = {};

  if (!data.UserId || !USERID_REGEX.test(data.UserId))
    errors.UserId = "Valid user ID is required";

  if (!data.EventId || !EVENTID_REGEX.test(data.EventId))
    errors.EventId = "Valid event ID is required";

  if (!data.NumberOfTickets || !TICKETS_REGEX.test(data.NumberOfTickets))
    errors.NumberOfTickets = "Number of tickets must be a whole number";

  if (Number(data.NumberOfTickets) < 1)
    errors.NumberOfTickets = "Must book at least 1 ticket";

  if (Number(data.NumberOfTickets) > 10)
    errors.NumberOfTickets = "Cannot book more than 10 tickets at once";

  return errors;
}

// GET - Fetch bookings
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("bookingId");
  const userId = searchParams.get("userId");

  try {
    // Get a specific booking by bookingId
    if (bookingId) {
      if (!BOOKINGID_REGEX.test(bookingId)) {
        return NextResponse.json(
          { success: false, message: "Invalid bookingId format" },
          { status: 400 }
        );
      }

      const [rows] = await pool.execute(
        `SELECT
           b.BookingId,
           b.BookingDate,
           b.NumberOfTickets,
           b.TotalPrice,
           b.Status,
           u.UserId,
           u.FirstName,
           u.LastName,
           u.Email,
           e.EventId,
           e.Title,
           e.Location,
           e.EventDate,
           e.EventTime,
           e.Price
         FROM Bookings b
         JOIN Users u ON b.UserId = u.UserId
         JOIN Events e ON b.EventId = e.EventId
         WHERE b.BookingId = ?`,
        [bookingId]
      );

      return NextResponse.json({
        success: true,
        booking: rows[0],
      });
    }

    // Get all bookings for a specific user
    if (userId) {
      if (!USERID_REGEX.test(userId)) {
        return NextResponse.json(
          { success: false, message: "Invalid userId format" },
          { status: 400 }
        );
      }

      const [rows] = await pool.execute(
        `SELECT
           b.BookingId,
           b.BookingDate,
           b.NumberOfTickets,
           b.TotalPrice,
           b.Status,
           u.UserId,
           u.FirstName,
           u.LastName,
           u.Email,
           e.EventId,
           e.Title,
           e.Location,
           e.EventDate,
           e.EventTime,
           e.Price
         FROM Bookings b
         JOIN Users u ON b.UserId = u.UserId
         JOIN Events e ON b.EventId = e.EventId
         WHERE b.UserId = ?
         ORDER BY b.BookingDate DESC`,
        [userId]
      );

      return NextResponse.json({
        success: true,
        bookings: rows,
      });
    }

    // Get ALL bookings if no params provided
    const [rows] = await pool.execute(
      `SELECT
         b.BookingId,
         b.BookingDate,
         b.NumberOfTickets,
         b.TotalPrice,
         b.Status,
         u.UserId,
         u.FirstName,
         u.LastName,
         u.Email,
         e.EventId,
         e.Title,
         e.Location,
         e.EventDate,
         e.EventTime,
         e.Price
       FROM Bookings b
       JOIN Users u ON b.UserId = u.UserId
       JOIN Events e ON b.EventId = e.EventId
       ORDER BY b.BookingDate DESC`
    );

    return NextResponse.json({
      success: true,
      bookings: rows,
    });

  } catch (err) {
    console.error("Bookings fetch error:", err);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// POST - Create new booking
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
    const errors = validateBooking(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors, values: body },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check if the event exists and get its details
      const [eventRows] = await connection.execute(
        "SELECT EventId, Capacity, Price FROM Events WHERE EventId = ?",
        [body.EventId]
      );

      if (eventRows.length === 0) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          { success: false, message: "Event not found" },
          { status: 404 }
        );
      }

      const event = eventRows[0];

      // Check how many tickets already booked for this event
      const [bookedRows] = await connection.execute(
        "SELECT SUM(NumberOfTickets) as TotalBooked FROM Bookings WHERE EventId = ? AND Status = 'confirmed'",
        [body.EventId]
      );

      const totalBooked = bookedRows[0].TotalBooked || 0;
      const remainingCapacity = event.Capacity - totalBooked;

      // Check if enough tickets are available
      if (Number(body.NumberOfTickets) > remainingCapacity) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          { success: false, message: `Only ${remainingCapacity} tickets remaining for this event` },
          { status: 409 }
        );
      }

      // Check if user already booked this event
      const [existingBooking] = await connection.execute(
        "SELECT BookingId FROM Bookings WHERE UserId = ? AND EventId = ? AND Status = 'confirmed'",
        [body.UserId, body.EventId]
      );

      if (existingBooking.length > 0) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
          { success: false, message: "You have already booked this event" },
          { status: 409 }
        );
      }

      // Calculate total price
      const totalPrice = event.Price * Number(body.NumberOfTickets);

      // Insert new booking
      const [insertResult] = await connection.execute(
        `INSERT INTO Bookings (UserId, EventId, BookingDate, NumberOfTickets, TotalPrice, Status)
         VALUES (?, ?, NOW(), ?, ?, 'confirmed')`,
        [
          body.UserId,
          body.EventId,
          body.NumberOfTickets,
          totalPrice,
        ]
      );

      await connection.commit();
      connection.release();

      const newBooking = {
        bookingId: insertResult.insertId,
        userId: body.UserId,
        eventId: body.EventId,
        numberOfTickets: body.NumberOfTickets,
        totalPrice: totalPrice,
        status: "confirmed",
      };

      return NextResponse.json(
        { success: true, booking: newBooking },
        { status: 201 }
      );

    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }

  } catch (err) {
    console.error("POST /api/bookings error:", err);
    return NextResponse.json(
      { success: false, errors: { general: "Something went wrong. Please try again." } },
      { status: 500 }
    );
  }
}

// DELETE - Cancel booking
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("bookingId");

  // Validate bookingId
  if (!bookingId || !BOOKINGID_REGEX.test(bookingId)) {
    return NextResponse.json(
      { success: false, message: "Valid bookingId is required" },
      { status: 400 }
    );
  }

  try {
    // Check booking exists before cancelling
    const [rows] = await pool.execute(
      "SELECT BookingId, Status FROM Bookings WHERE BookingId = ?",
      [bookingId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if already cancelled
    if (rows[0].Status === "cancelled") {
      return NextResponse.json(
        { success: false, message: "Booking is already cancelled" },
        { status: 409 }
      );
    }

    // Cancel booking by updating status
    await pool.execute(
      "UPDATE Bookings SET Status = 'cancelled' WHERE BookingId = ?",
      [bookingId]
    );

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
    });

  } catch (err) {
    console.error("DELETE /api/bookings error:", err);
    return NextResponse.json(
      { success: false, message: "Cancellation failed" },
      { status: 500 }
    );
  }
}