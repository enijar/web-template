import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { BrowserRouter as Router } from "react-router-dom";
import trpc from "@/services/trpc";
import config from "@/config";
import App from "@/components/app/app";

const rootElement = document.querySelector("#root");
const root = ReactDOM.createRoot(rootElement!);

const queryClient = new QueryClient();

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${config.apiUrl}/trpc`,
    }),
  ],
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
