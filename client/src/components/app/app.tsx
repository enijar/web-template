import React from "react";
import { RouterProvider } from "react-router-dom";
import * as Style from "~/components/app/app.style";
import router from "~/router";
import Loading from "~/components/loading/loading";

export default function App() {
  return (
    <>
      <Style.Reset />
      <React.Suspense fallback={<Loading />}>
        <RouterProvider router={router} />
      </React.Suspense>
    </>
  );
}
