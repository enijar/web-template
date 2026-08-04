import React from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Style from "client/pages/register/register.style.js";
import { useAuth } from "client/hooks/use-auth.js";
import { errorMessage } from "client/services/errors.js";
import Form from "client/components/form/form.js";

export default function Register() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = React.useState<string | null>(null);
  return (
    <Style.Wrapper>
      <h1>Register</h1>
      {auth.user === null ? (
        <Form
          onSubmit={async (form) => {
            try {
              setFormError(null);
              await auth.register(form.data);
              await navigate("/");
            } catch (err) {
              setFormError(errorMessage(err));
            }
          }}
        >
          {formError !== null && <pre>{formError}</pre>}
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" autoComplete="email" />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" name="password" autoComplete="new-password" />
          <button>Register</button>
          <Link to="/">Already have an account? Login</Link>
        </Form>
      ) : (
        <p>
          Signed in as {auth.user.email}. <Link to="/">Go home</Link>
        </p>
      )}
    </Style.Wrapper>
  );
}
