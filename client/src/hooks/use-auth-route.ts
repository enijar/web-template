import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/state/auth";

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
  const navigate = useNavigate();

  const { authenticating, user } = useAuth();

  const configRef = React.useRef({ ...defaultConfig, ...config });

  const authenticated = React.useMemo(() => user !== null, [user]);

  React.useEffect(() => {
    if (authenticating) return;
    if (configRef.current.type === "authenticated" && user !== null) return;
    if (configRef.current.type === "unauthenticated" && user === null) return;
    navigate(configRef.current.redirect);
  }, [authenticating, user]);

  return { authenticated };
}
