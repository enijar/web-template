import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginModel } from "@app/shared";
import api from "@/services/api";
import { useAuth } from "@/state/auth";
import useAuthRoute from "@/hooks/use-auth-route";
import useForm from "@/hooks/use-form";

type Data = {
  email: string;
  password: string;
};

export default function Login() {
  const navigate = useNavigate();
  const [messages, setMessages] = React.useState<{ [key: string]: string }>({});
  const form = useForm<Data>({
    model: loginModel,
    async onSubmit(form) {
      const res = await api.post("/api/login", form.data);
      setMessages(res.messages);
      form.setErrors(res.errors);
      if (res.ok) {
        useAuth.getState().setUser(res.data.user);
        form.reset();
        navigate("/");
      }
    },
  });

  const { authenticated } = useAuthRoute({
    redirect: "/",
    type: "unauthenticated",
  });
  if (authenticated) return null;

  return (
    <main>
      <h1>Login</h1>

      <div>{form.errors.server}</div>
      <div>{messages.server}</div>

      <form onSubmit={form.onSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            onChange={form.onChange}
            value={form.data.email ?? ""}
          />
          <div>{form.errors.email}</div>
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            onChange={form.onChange}
            value={form.data.password ?? ""}
          />
          <div>{form.errors.password}</div>
        </div>
        <div>
          <button>Login</button>
          or <Link to="/register">Register</Link>
        </div>
      </form>
    </main>
  );
}
