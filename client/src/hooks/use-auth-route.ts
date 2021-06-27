import React from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../state/auth";

type Config = {
  redirect?: string;
  type?: "authenticated" | "unauthenticated";
};

type UseAuthRoute = {
  authenticated: boolean;
};

const defaultConfig = {
  redirect: "/login",
  type: "authenticated",
};

export default function useAuthRoute(config: Config = {}): UseAuthRoute {
  const history = useHistory();

  const { authenticating, user } = useAuth();

  const configRef = React.useRef({ ...defaultConfig, ...config });

  const authenticated = React.useMemo(() => user !== null, [user]);

  React.useEffect(() => {
    if (authenticating) return;
    if (configRef.current.type === "authenticated" && user !== null) return;
    if (configRef.current.type === "unauthenticated" && user === null) return;
    history.push(configRef.current.redirect);
  }, [authenticating, user, history]);

  return { authenticated };
}
