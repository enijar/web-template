import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "client/router.js";
import Loading from "client/components/loading/loading.js";
import trpc from "client/services/trpc.js";
import { appState } from "client/state/app-state.js";

export default function App() {
  const setUser = appState((state) => state.setUser);
  const me = trpc.me.useQuery();
  React.useEffect(() => {
    if (!me.isPending) {
      setUser(me.data ?? null);
    }
  }, [me.isPending, me.data, setUser]);
  return (
    <React.Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </React.Suspense>
  );
}
