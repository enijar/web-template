import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginModel } from "@app/shared";
import api from "@/services/api";
import { useAuth } from "@/state/auth";
import useForm from "@/hooks/use-form";
import useAuthRoute from "@/hooks/use-auth-route";

export default function Login() {
  const navigate = useNavigate();
  const [messages, setMessages] = React.useState<{ [key: string]: string }>({});
  const { data, setData, errors, setErrors, onChange, onSubmit } = useForm(
    loginModel,
    async (data) => {
      const res = await api.post("/api/login", data);
      setMessages(res.messages);
      setErrors(res.errors);
      if (res.ok) {
        useAuth.getState().setUser(res.data.user);
        setData({});
        navigate("/");
      }
    }
  );

  const { authenticated } = useAuthRoute({
    redirect: "/",
    type: "unauthenticated",
  });
  if (authenticated) return null;

  return (
    <main>
      <h1>Login</h1>

      <div>{errors.server}</div>
      <div>{messages.server}</div>

      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            onChange={onChange}
            value={data.email ?? ""}
          />
          <div>{errors.email}</div>
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            onChange={onChange}
            value={data.password ?? ""}
          />
          <div>{errors.password}</div>
        </div>
        <div>
          <button>Login</button>
          or <Link to="/register">Register</Link>
        </div>
      </form>
    </main>
  );
}
