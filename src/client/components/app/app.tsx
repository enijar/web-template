import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "client/router.js";
import Loading from "client/components/loading/loading.js";

export default function App() {
  return (
    <React.Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </React.Suspense>
  );
}
