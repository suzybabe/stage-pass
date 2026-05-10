"use client";

import { useEffect, useState } from "react";
import NavBar from "./NavBar";

export default function DynamicNavBar() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/me", {
          credentials: "include",
        });

        const data = await response.json();

        if (data.success && data.user) {
          setRole(data.user.Role);
        } else {
          setRole("home");
        }
      } catch (error) {
        console.error(error);
        setRole("home");
      }
    }

    fetchUser();
  }, []);

  return <NavBar role={role} />;
}