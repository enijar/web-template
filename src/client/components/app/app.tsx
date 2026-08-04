import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import router from "client/router.js";
import Loading from "client/components/loading/loading.js";
import trpc from "client/services/trpc.js";
import { appState } from "client/state/app-state.js";
import type { Api } from "client/services/api.js";

type Props = {
  api: Api;
};

export default function App(props: Props) {
  return (
    <trpc.Provider client={props.api.trpcClient} queryClient={props.api.queryClient}>
      <QueryClientProvider client={props.api.queryClient}>
        <Session />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function Session() {
  const setUser = appState((state) => state.setUser);
  const me = trpc.me.useQuery();
  React.useEffect(() => {
    if (!me.isPending) {
      setUser(me.data ?? null);
    }
  }, [me.isPending, me.data, setUser]);
  // Wait for the session lookup so a signed-in user doesn't see a flash of the login form
  if (me.isPending) {
    return <Loading />;
  }
  return (
    <React.Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </React.Suspense>
  );
}
