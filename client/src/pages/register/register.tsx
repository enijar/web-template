import React from "react";
import { Link } from "react-router-dom";
import { registerModel } from "@app/shared";
import useForm from "../../hooks/use-form";
import api from "../../services/api";
import useAuthRoute from "../../hooks/use-auth-route";

export default function Register() {
  const [messages, setMessages] = React.useState<{ [key: string]: string }>({});
  const { data, setData, errors, setErrors, onChange, onSubmit } = useForm(
    registerModel,
    async (data) => {
      const res = await api.post("/api/register", data);
      setMessages(res.messages);
      setErrors(res.errors);
      if (res.ok) {
        setData({});
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
      <h1>Register</h1>

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
            autoComplete="new-password"
            onChange={onChange}
            value={data.password ?? ""}
          />
          <div>{errors.password}</div>
        </div>
        <div>
          <label htmlFor="passwordConfirmation">Confirm Password</label>
          <input
            id="passwordConfirmation"
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            onChange={onChange}
            value={data.passwordConfirmation ?? ""}
          />
          <div>{errors.passwordConfirmation}</div>
        </div>
        <div>
          <button>Register</button> or <Link to="/">Login</Link>
        </div>
      </form>
    </main>
  );
}
