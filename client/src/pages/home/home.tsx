import React from "react";
import trpc from "~/services/trpc";

export default function Home() {
  const { data, refetch } = trpc.getServerTime.useQuery(undefined, { suspense: true });
  return (
    <main>
      <h1>Home</h1>
      <div>
        <button onClick={() => refetch()}>Get Server Time</button>
      </div>
      <p>
        Server time: <time>{data}</time>
      </p>
    </main>
  );
}
