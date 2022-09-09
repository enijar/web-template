import React from "react";
import trpc from "@/services/trpc";

export default function Home() {
  const { data, mutate } = trpc.useMutation(["getServerTime"]);

  return (
    <main>
      <h1>Home</h1>
      <div>
        <button onClick={() => mutate()}>Get Server Time</button>
      </div>
      <time>{data}</time>
    </main>
  );
}
