import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpLink } from "@trpc/client";
import "client/global.css";
import trpc from "client/services/trpc.js";
import App from "client/components/app/app.js";

const root = document.querySelector("#root");

if (root === null) {
  throw new Error("No #root element");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: "/trpc",
    }),
  ],
});

ReactDOM.createRoot(root).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>,
);
