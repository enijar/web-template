import React from "react";
import { RouterProvider } from "react-router-dom";
import * as Style from "client/components/app/app.style";
import router from "client/router";
import Loading from "client/components/loading/loading";

export default function App() {
  return (
    <>
      <h1>App</h1>
      <Style.Reset />
      <React.Suspense fallback={<Loading />}>
        <RouterProvider router={router} />
      </React.Suspense>
    </>
  );
}
