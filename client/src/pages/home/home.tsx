import React from "react";
import trpc from "@/services/trpc";

export default function Home() {
  const getServerTime = trpc.getServerTime.useMutation();

  return (
    <main>
      <h1>Home</h1>
      <div>
        <button onClick={() => getServerTime.mutate()}>Get Server Time</button>
      </div>
      <time>{getServerTime.data}</time>
    </main>
  );
}
