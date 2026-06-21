import React from "react";
import { createBrowserRouter as createRouter, Outlet } from "react-router-dom";
import ErrorPage from "client/components/error/error.js";
import Loading from "client/components/loading/loading.js";

const basename = import.meta.env.BASE_URL.replace(/\/+$/, "") || "/";

export const router = createRouter(
  [
    {
      element: <Outlet />,
      errorElement: <ErrorPage />,
      hydrateFallbackElement: <Loading />,
      children: [
        {
          path: "/",
          Component: React.lazy(() => import("client/pages/home/home.js")),
        },
        {
          path: "/reset-password",
          Component: React.lazy(() => import("client/pages/reset-password/reset-password.js")),
        },
      ],
    },
  ],
  { basename },
);

export default router;
