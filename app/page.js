import Image from "next/image";
import "./home.css"; // Import your Tailwind-based CSS file
import DynamicNavBar from "./components/DynamicNavBar";
import Link from "next/link";

export default function Home() {
  return (
    <>
    <DynamicNavBar />
    <main className="home-container">
    
    
      {/* welcome message and button to direct you to events without using nav */ }
      <section className="hero">
        <h1 className="hero-title">Find Your Next Concert</h1>
        <p className="hero-subtitle">
          Discover live music, festivals, and unforgettable events.
        </p>

        <div className="hero-actions">
          <Link href="/events_page" className="hero-button">
           Explore Events
          </Link>

          <Link href="/login_page" className="secondary-button">
            Sign In
          </Link>

          <Link href="/signin_page" className="secondary-button">
            Create Account
          </Link>

          <Link href="/organiser_dashboard" className="secondary-button">
            Organisers
          </Link>

        </div>   
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
    </>
  );
}
