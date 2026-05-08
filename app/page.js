import Image from "next/image";
import "./home.css"; // Import your Tailwind-based CSS file

export default function Home() {
  return (
    <main className="home-container">

      {/* welcome message and button to direct you to events without using nav */ }
      <section className="hero">
        <h1 className="hero-title">Find Your Next Concert</h1>
        <p className="hero-subtitle">
          Discover live music, festivals, and unforgettable events.
        </p>
        <button className="hero-button">Explore Events</button>
        <ul>
        <a href="/booking_page">Go to booking page, </a>
        <a href="/signin_page">Go to sign-in page, </a>
        <a href="/login_page">Go to log-in page, </a>
        <a href="/events_page">Go to events page </a>
        </ul>      
      </section>
  
      
 {/* display of events, letting users know what is happening atm */}
      <section className="events">
        <h2 className="events-title">Featured Events</h2>


        <div className="events-grid">
          <div className="event-card">
            <h3>Rock Night Festival</h3>
            <p>June 12, 2026 — Dublin</p>
          </div>


          <div className="event-card">
            <h3>Summer EDM Bash</h3>
            <p>July 3, 2026 — Cork</p>
          </div>


          <div className="event-card">
            <h3>Indie Acoustic Evening</h3>
            <p>May 28, 2026 — Galway</p>
          </div>
        </div>
      </section>

 {/* basic footer for time being */} 
      <footer className="footer">
        © 2026 StagePass — All Rights Reserved
      </footer>

    </main>
  );
}
