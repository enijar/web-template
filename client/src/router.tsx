import React from "react";
import { createBrowserRouter as createRouter, Outlet } from "react-router-dom";
import ErrorPage from "~/components/error/error";
import Loading from "~/components/loading/loading";

export const router = createRouter([
  {
    element: <Outlet />,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <Loading />,
    children: [
      {
        path: "/",
        Component: React.lazy(() => import("~/pages/home/home")),
      },
    ],
  },
]);

export default router;
