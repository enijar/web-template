import React from "react";
import config from "@/config";
import useAuthRoute from "@/hooks/use-auth-route";

export default function Dashboard() {
  const { authenticated } = useAuthRoute();
  if (!authenticated) return null;

  return (
    <main>
      <header>
        <a href={`${config.apiUrl}/api/logout`}>Logout</a>
      </header>
      <h1>Dashboard</h1>
    </main>
  );
}
