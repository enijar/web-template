import React from "react";
import { useRouteError } from "react-router-dom";

export default function Error() {
  const error = useRouteError();
  React.useEffect(() => {
    console.log(error);
  }, [error]);

  return <>Error</>;
}
