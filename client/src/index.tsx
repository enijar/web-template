import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import Reset from "@/styles/reset";
import App from "@/components/app/app";

const root = ReactDOM.createRoot(document.querySelector("#root"));

root.render(
  <React.StrictMode>
    <Router>
      <Reset />
      <App />
    </Router>
  </React.StrictMode>
);
