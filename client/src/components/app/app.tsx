import React from "react";
import { Switch, Route } from "react-router-dom";

const Login = React.lazy(() => import("../../pages/login/login"));
const Register = React.lazy(() => import("../../pages/register/register"));

export default function App() {
  return (
    <React.Suspense fallback="Loading...">
      <Switch>
        <Route exact path="/" component={Login} />
        <Route exact path="/register" component={Register} />
      </Switch>
    </React.Suspense>
  );
}
