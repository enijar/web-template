import React from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
import ErrorPage from "~/components/error/error";
import Loading from "~/components/loading/loading";

export const router = createBrowserRouter([
  {
    element: <Outlet />,
    errorElement: <ErrorPage />,
    hydrateFallbackElement: <Loading />,
    children: [
      {
        id: "home",
        path: "/",
        Component: React.lazy(() => import("~/pages/home/home")),
      },
    ],
  },
]);

export default router;
