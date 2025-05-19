import React from "react";
import { useRouteError } from "react-router-dom";
import { TRPCClientError } from "@trpc/client";

export default function Error() {
  const err = useRouteError();
  const message = React.useMemo(() => {
    if (err instanceof TRPCClientError) return err.message;
    return "Oops! Something went wrong.";
  }, [err]);
  return (
    <>
      <p>{message}</p>
    </>
  );
}
