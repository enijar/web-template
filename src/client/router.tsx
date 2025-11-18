import React from "react";
import { createBrowserRouter as createRouter, Outlet } from "react-router-dom";
import ErrorPage from "client/components/error/error";
import Loading from "client/components/loading/loading";

export const router = createRouter([
  {
    element: <Outlet />,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <Loading />,
    children: [
      {
        path: "/",
        Component: React.lazy(() => import("client/pages/home/home")),
      },
    ],
  },
]);

export default router;
