import React from "react";
import { Link } from "react-router-dom";
import { registerModel } from "@app/shared";
import api from "@/services/api";
import useAuthRoute from "@/hooks/use-auth-route";
import useForm from "@/hooks/use-form";

type Data = {
  email: string;
  password: string;
  passwordConfirmation: string;
};

export default function Register() {
  const [messages, setMessages] = React.useState<{ [key: string]: string }>({});
  const form = useForm<Data>({
    model: registerModel,
    async onSubmit(form) {
      const res = await api.post("/api/register", form.data);
      setMessages(res.messages);
      form.setErrors(res.errors);
      if (res.ok) {
        form.setData({});
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
      <h1>Register</h1>

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
            autoComplete="new-password"
            onChange={form.onChange}
            value={form.data.password ?? ""}
          />
          <div>{form.errors.password}</div>
        </div>
        <div>
          <label htmlFor="passwordConfirmation">Confirm Password</label>
          <input
            id="passwordConfirmation"
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            onChange={form.onChange}
            value={form.data.passwordConfirmation ?? ""}
          />
          <div>{form.errors.passwordConfirmation}</div>
        </div>
        <div>
          <button>Register</button>
          or <Link to="/">Login</Link>
        </div>
      </form>
    </main>
  );
}
