import React from "react";
import { Route, Routes } from "react-router-dom";
import { AppReset } from "@/components/app/app.styles";
import api from "@/services/api";
import { useAuth } from "@/state/auth";

const Dashboard = React.lazy(() => import("@/pages/dashboard/dashboard"));
const Login = React.lazy(() => import("@/pages/login/login"));
const Register = React.lazy(() => import("@/pages/register/register"));

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
      <AppReset />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </React.Suspense>
  );
}
