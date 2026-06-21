import React from "react";
import { TRPCClientError } from "@trpc/client";
import * as Style from "client/pages/home/home.style.js";
import { appState } from "client/state/app-state.js";
import trpc from "client/services/trpc.js";
import Form from "client/components/form/form.js";

export default function Home() {
  const user = appState((state) => state.user);
  const setUser = appState((state) => state.setUser);
  const login = trpc.login.useMutation();
  const passwordReset = trpc.passwordReset.useMutation();
  const logout = trpc.logout.useMutation();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [forgotPassword, setForgotPassword] = React.useState(false);
  return (
    <Style.Wrapper>
      <h1>Home</h1>
      <div>
        {user === null ? (
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
                  setUser(await login.mutateAsync(form.data));
                  form.element.reset();
                }
              } catch (err) {
                setFormError(err instanceof TRPCClientError ? err.message : "Something went wrong");
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
          </Form>
        ) : (
          <>
            <p>Signed in as {user.email}</p>
            <button
              onClick={async () => {
                await logout.mutateAsync();
                setUser(null);
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </Style.Wrapper>
  );
}
