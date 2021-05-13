import React from "react";
import { Switch, Route } from "react-router-dom";

const Home = React.lazy(() => import("../../pages/home/home"));
const About = React.lazy(() => import("../../pages/about/about"));

export default function App() {
  return (
    <React.Suspense fallback="Loading...">
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/about" component={About} />
      </Switch>
    </React.Suspense>
  );
}
