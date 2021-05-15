import React from "react";
import config from "../../config";

export default function Dashboard() {
  return (
    <main>
      <header>
        <a href={`${config.apiUrl}/api/logout`}>Logout</a>
      </header>
      <h1>Dashboard</h1>
    </main>
  );
}
