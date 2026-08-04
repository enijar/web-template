import React from "react";
import { Link } from "react-router-dom";
import * as Style from "client/pages/home/home.style.js";
import { useAuth } from "client/hooks/use-auth.js";
import { errorMessage } from "client/services/errors.js";
import trpc from "client/services/trpc.js";
import Form from "client/components/form/form.js";

export default function Home() {
  const auth = useAuth();
  const passwordReset = trpc.passwordReset.useMutation();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [forgotPassword, setForgotPassword] = React.useState(false);
  return (
    <Style.Wrapper>
      <h1>Home</h1>
      <div>
        {auth.user === null ? (
          <Form
            onSubmit={async (form) => {
              try {
                setFormError(null);
                setNotice(null);
                if (forgotPassword) {
                  await passwordReset.mutateAsync(form.data);
                  form.element.reset();
                  setForgotPassword(false);
                  setNotice("If that email is registered, a reset link is on its way.");
                } else {
                  await auth.login(form.data);
                  form.element.reset();
                }
              } catch (err) {
                setFormError(errorMessage(err));
              }
            }}
          >
            {formError !== null && <pre>{formError}</pre>}
            {notice !== null && <p>{notice}</p>}
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" autoComplete="email" />
            {!forgotPassword && (
              <>
                <label htmlFor="password">Password</label>
                <input id="password" type="password" name="password" autoComplete="current-password" />
                <button type="button" onClick={() => setForgotPassword(true)}>
                  Forgot Password?
                </button>
              </>
            )}
            <button>{forgotPassword ? "Reset password" : "Login"}</button>
            <Link to="/register">Need an account? Register</Link>
          </Form>
        ) : (
          <>
            <p>Signed in as {auth.user.email}</p>
            <button
              onClick={async () => {
                try {
                  setFormError(null);
                  await auth.logout();
                } catch (err) {
                  setFormError(errorMessage(err));
                }
              }}
            >
              Logout
            </button>
            {formError !== null && <pre>{formError}</pre>}
          </>
        )}
      </div>
    </Style.Wrapper>
  );
}
