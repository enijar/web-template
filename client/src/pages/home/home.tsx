import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [count, setCount] = React.useState<number>(0);

  return (
    <div>
      <h1>Home ({count})</h1>

      <div>
        <button onClick={() => setCount((count) => count + 1)}>add</button>
        <button onClick={() => setCount((count) => count - 1)}>sub</button>
      </div>

      <Link to="/about">about</Link>
    </div>
  );
}
