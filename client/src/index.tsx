import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import trpc from "./services/trpc";
import config from "./config";
import App from "./components/app/app";

const rootElement = document.querySelector("#root");
const root = ReactDOM.createRoot(rootElement!);

const queryClient = new QueryClient();

const trpcClient = trpc.createClient({
  url: `${config.apiUrl}/trpc`,
  fetch(url, options) {
    return fetch(url, { ...options, credentials: "include" });
  },
});

root.render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <Router>
        <App />
      </Router>
    </QueryClientProvider>
  </trpc.Provider>
);
