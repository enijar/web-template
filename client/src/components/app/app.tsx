import React from "react";
import { Route, Switch } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../state/auth";

const Dashboard = React.lazy(() => import("../../pages/dashboard/dashboard"));
const Login = React.lazy(() => import("../../pages/login/login"));
const Register = React.lazy(() => import("../../pages/register/register"));

export default function App() {
  const { authenticating, setAuthenticating, setUser } = useAuth();

  React.useEffect(() => {
    api.get("/api/user").then((res) => {
      if (res.ok) {
        setUser(res.data.user ?? null);
      }
      setAuthenticating(false);
    });
  }, []);

  if (authenticating) {
    return <div>Authenticating...</div>;
  }

  return (
    <React.Suspense fallback="Loading...">
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
      </Switch>
    </React.Suspense>
  );
}
