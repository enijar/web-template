import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { httpLink, TRPCClientError } from "@trpc/client";
import trpc from "client/services/trpc.js";

export type ApiOptions = {
  url: string;
  // Injectable transport so tests can route requests to an in-memory server
  fetch?: typeof globalThis.fetch;
  // Called when any request fails with UNAUTHORIZED, e.g. an expired or revoked session
  onUnauthorized?: () => void;
};

export type Api = ReturnType<typeof createApi>;

function isUnauthorized(error: unknown) {
  return error instanceof TRPCClientError && error.data?.code === "UNAUTHORIZED";
}

export function createApi(options: ApiOptions) {
  function onError(error: unknown) {
    if (isUnauthorized(error)) {
      options.onUnauthorized?.();
    }
  }
  const queryClient = new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
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
        url: options.url,
        fetch: options.fetch,
      }),
    ],
  });
  return { queryClient, trpcClient };
}
