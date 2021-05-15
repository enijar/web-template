import React from "react";
import { Link } from "react-router-dom";
import { loginModel } from "@app/shared";
import useForm from "../../hooks/use-form";
import api from "../../services/api";

export default function Login() {
  const [messages, setMessages] = React.useState<{ [key: string]: string }>({});
  const { data, setData, errors, setErrors, onChange, onSubmit } = useForm(
    loginModel,
    async (data) => {
      const res = await api.post("/api/login", data);
      setMessages(res.messages);
      setErrors(res.errors);
      if (res.ok) {
        setData({});
      }
    }
  );

  return (
    <div>
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
          <button>Login</button> or <Link to="/register">Register</Link>
        </div>
      </form>
    </div>
  );
}
