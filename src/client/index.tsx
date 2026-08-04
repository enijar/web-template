import React from "react";
import ReactDOM from "react-dom/client";
import "client/global.css";
import { createApi } from "client/services/api.js";
import { appState } from "client/state/app-state.js";
import App from "client/components/app/app.js";

const root = document.querySelector("#root");

if (root === null) {
  throw new Error("No #root element");
}

const api = createApi({
  url: `${import.meta.env.BASE_URL.replace(/\/+$/, "")}/trpc`,
  onUnauthorized() {
    appState.getState().setUser(null);
  },
});

ReactDOM.createRoot(root).render(<App api={api} />);
