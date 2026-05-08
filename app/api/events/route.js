import pool from "../libs/db";
import { NextResponse } from "next/server";
// validation regex patterns
const EVENTID_REGEX = /^\d+$/;
const TITLE_REGEX = /^[a-zA-Z0-9 .&'-]{3,100}$/;
const LOCATION_REGEX = /^[a-zA-Z0-9 .,'"-]{3,200}$/;
const PRICE_REGEX = /^\d+(\.\d{1,2})?$/;
const CAPACITY_REGEX = /^\d+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;

const VALID_EVENT_TYPES = ["Concert", "Workshop", "Festival", "Theatre", "Comedy", "Sports"];

// Validate event data before saving to database
function validateEvent(data) {
  const errors = {};

  if (!data.Title || !TITLE_REGEX.test(data.Title))
    errors.Title = "Title must be between 3 and 100 characters";

  if (!data.Description || data.Description.trim().length < 10)
    errors.Description = "Description must be at least 10 characters";

  if (!data.Location || !LOCATION_REGEX.test(data.Location))
    errors.Location = "Please enter a valid location";

  if (!data.Price || !PRICE_REGEX.test(data.Price))
    errors.Price = "Please enter a valid price (e.g. 10 or 10.99)";

  if (!data.Capacity || !CAPACITY_REGEX.test(data.Capacity))
    errors.Capacity = "Capacity must be a whole number";

  if (!data.EventDate || !DATE_REGEX.test(data.EventDate))
    errors.Date = "Date must be in YYYY-MM-DD format";

  if (!data.EventTime || !TIME_REGEX.test(data.EventTime))
    errors.Time = "Time must be in HH:MM format";

  if (!data.EventType || !VALID_EVENT_TYPES.includes(data.EventType))
    errors.EventType = "Please select a valid event type";

  if (!data.OrganiserId || !EVENTID_REGEX.test(data.OrganiserId))
    errors.OrganiserId = "Invalid organiser ID";

  return errors;
}

// get event api route handler
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
// If eventId is provided, validate it and fetch the specific event, otherwise fetch all events
    try {
        //search for the event in the database by eventId
        if (eventId) {
            if(!EVENTID_REGEX.test(eventId)) {
                return NextResponse.json(
                    { success: false, message: "Invalid eventId format" }, 
                    { status: 400 }
                );
            }
            const [rows] = await pool.execute(
            `SELECT
           e.EventId,
           e.Title,
           e.Description,
           e.Location,
           e.EventDate,
           e.EventTime,
           e.Capacity,
           e.Price,
           e.EventType,
           u.UserId,
           u.FirstName,
           u.LastName,
           u.Email
         FROM Events e
         JOIN Users u ON e.OrganiserId = u.UserId
         WHERE e.EventId = ?`,
        [eventId]
      );
      return NextResponse.json({ 
        success: true, 
        event: rows[0],
    });
}

// Get all events if no eventId provided
    const [rows] = await pool.execute(
      `SELECT
         e.EventId,
         e.Title,
         e.Description,
         e.Location,
         e.EventDate,
         e.EventTime,
         e.Capacity,
         e.Price,
         e.EventType,
         u.UserId,
         u.FirstName,
         u.LastName,
         u.Email
       FROM Events e
       JOIN Users u ON e.OrganiserId = u.UserId
       ORDER BY e.EventDate ASC`
    );

    return NextResponse.json({
      success: true,
      events: rows,
    });

  } catch (err) {
    console.error("Events fetch error:", err);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
      //Post - create new event api route handler
     export async function POST(request) {
  try {
    const body = await request.json();

    // Run validation
    const errors = validateEvent(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors, values: body },
        { status: 400 }
      );
    }
     // Check if event with same title, date and location already exists
    const [existing] = await pool.execute(
      "SELECT EventId FROM Events WHERE Title = ? AND EventDate = ? AND Location = ?",
      [body.Title, body.EventDate, body.Location]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "An event with the same title, date and location already exists" },
        { status: 409 }
      );
    }
    const [insertresult] = await pool.execute(
        `INSERT INTO Events (Title, Description, Location, EventDate, EventTime, Capacity, Price, EventType, OrganiserId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.Title,
        body.Description,
        body.Location,
        body.EventDate,
        body.EventTime,
        body.Capacity,
        body.Price,
        body.EventType,
        body.OrganiserId,
      ]
    );

   // Fetch the newly created event to return in the response
    const newEvent = {
      eventId: insertresult.insertId,
      title: body.Title,
      description: body.Description,
      location: body.Location,
      date: body.EventDate,
      time: body.EventTime,
      capacity: body.Capacity,
      price: body.Price,
      eventType: body.EventType,
      organiserId: body.OrganiserId,
    };

    return NextResponse.json(
      { success: true, event: newEvent },
      { status: 201 }
    );

  } catch (err) {
    console.error("POST /api/events error:", err);
    return NextResponse.json(
      { success: false, errors: { general: "Something went wrong. Please try again." } },
      { status: 500 }
    );
}
     }
     // Put - update existing event api route handler
     export async function PUT(request) {
  try {
    
    const body = await request.json();
   
     // eventId is required to know which event to update
    if (!body.eventId || !EVENTID_REGEX.test(body.eventId)) {
      return NextResponse.json(
        { success: false, message: "Valid eventId is required" },
        { status: 400 }
      );
    }
    // Run validation
    const errors = validateEvent(body);
    if (Object.keys(errors).length > 0) {
        return NextResponse.json(
            { success: false, errors, values: body },
            { status: 400 }
        );
    }

    const connection =  await pool.getConnection();
    await connection.beginTransaction();
    
     try {
    //find the event in the database by eventId
    const [eventRows] = await connection.execute(
      "SELECT EventId FROM Events WHERE EventId = ?",
      [body.eventId],
    );
    if (eventRows.length === 0) {
        await connection.rollback();
        connection.release();
        return NextResponse.json(
            { success: false, message: "Event not found" },
            { status: 404 }
        );
    }

     // Map fields to update dynamically
    const fieldMap = {
      Title: "Title",
      Description: "Description",
      Location: "Location",
      Date: "Date",
      Time: "Time",
      Capacity: "Capacity",
      Price: "Price",
      EventType: "EventType",
    };

    const updates = [];
    const values = [];

    for (const [frontendField, dbField] of Object.entries(fieldMap)) {
      if (body[frontendField] !== undefined) {
        updates.push(`${dbField} = ?`);
        values.push(body[frontendField]);
      }
    }

    //add eventId to values for the WHERE clause
    values.push(eventId);

    
      if (updates.length > 0) {
        values.push(eventId);
        const query = `UPDATE Events SET ${updates.join(", ")} WHERE EventId = ?`;
        await connection.execute(query, values);
      }
        // Commit transaction and release connection
      await connection.commit();
      connection.release();

      return NextResponse.json({
        success: true,
        message: "Event updated successfully",
      });
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
 } catch (err) {
    console.error("PUT /api/events error:", err);
    return NextResponse.json(
      { success: false, message: "Update failed" },
      { status: 500 }
    );
  }
}

// Delete - delete existing event api route handler
export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  // Validate eventId
    if (!eventId || !EVENTID_REGEX.test(eventId)) {
    return NextResponse.json(
      { success: false, message: "Valid eventId is required" },
      { status: 400 }
    );
  }

  try {
    // Check event exists before deleting
    const [rows] = await pool.execute(
      "SELECT EventId FROM Events WHERE EventId = ?",
      [eventId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    // Delete the event
    await pool.execute(
      "DELETE FROM Events WHERE EventId = ?",
      [eventId]
    );

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });

  } catch (err) {
    console.error("DELETE /api/events error:", err);
    return NextResponse.json(
      { success: false, message: "Deletion failed" },
      { status: 500 }
    );
  }
}



