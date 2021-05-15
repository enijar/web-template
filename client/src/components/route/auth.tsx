import React from "react";
import { Route, useHistory } from "react-router-dom";
import { useAuth } from "../../state/auth";

type Props = {
  exact?: boolean;
  path: string;
  component: React.FC;
};

export default function AuthRoute({ exact, path, component }: Props) {
  const history = useHistory();
  const { authenticating, user } = useAuth();

  React.useEffect(() => {
    if (!authenticating && user === null) {
      history.push("/login");
    }
  }, [authenticating, user, history]);

  return (
    <Route
      exact={exact}
      path={path}
      component={user === null ? null : component}
    />
  );
}
