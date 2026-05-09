//Reusable card component for displaying events
export default function EventCard({ event, bookingMode = false }) {
    
  return (

    <div className="event-card">
      <h2 className="event-name">{event.Title}</h2>

      <p className="event-description">{event.Description}</p>

      <p className="event-detail">
        <strong>Date:</strong>{" "}
        {event.EventDate ? new Date(event.EventDate).toLocaleDateString() : ""}
      </p>

      <p className="event-detail">
        <strong>Time:</strong> {event.EventTime}
      </p>

      <p className="event-detail">
        <strong>Location:</strong> {event.Location}
      </p>

      <p className="event-detail">
        <strong>Price:</strong> €{event.Price}
      </p>

      {bookingMode && (
        <>
          <p className="event-detail">
            <strong>Tickets:</strong> {event.NumberOfTickets}
          </p>

          <p className="event-detail">
            <strong>Total:</strong> €{event.TotalPrice}
          </p>

          <p className="event-detail">
            <strong>Status:</strong> {event.Status}
          </p>
        </>
      )}

      {!bookingMode && (
        <>
          <p className="event-detail">
            <strong>Capacity:</strong> {event.Capacity}
          </p>

          <p className="event-detail">
            <strong>Type:</strong> {event.EventType}
          </p>
        </>
      )}

      <p className="event-organiser">
        {bookingMode ? "Booked by:" : "Organised by:"} {event.FirstName}{" "}
        {event.LastName} ({event.Email})
      </p>
    </div>
  );
}