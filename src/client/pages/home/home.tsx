import React from "react";
import { TRPCClientError } from "@trpc/client";
import * as Style from "client/pages/home/home.style.js";
import { appState } from "client/state/app-state.js";
import trpc from "client/services/trpc.js";
import Form from "client/components/form/form.js";

export default function Home() {
  const user = appState((state) => state.user);
  const login = trpc.login.useMutation();
  const passwordReset = trpc.passwordReset.useMutation();
  const [formError, setFormError] = React.useState<string | null>(null);
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
                if (forgotPassword) {
                  await passwordReset.mutateAsync(form.data);
                } else {
                  await login.mutateAsync(form.data);
                }
                form.element.reset();
              } catch (err) {
                setFormError(err instanceof TRPCClientError ? err.message : "Something went wrong");
              }
            }}
          >
            {formError !== null && <pre>{formError}</pre>}
            <input type="email" name="email" />
            {!forgotPassword && (
              <>
                <input type="password" name="password" />
                <button type="button" onClick={() => setForgotPassword(true)}>
                  Forgot Password?
                </button>
              </>
            )}
            <button>{forgotPassword ? "Reset password" : "Login"}</button>
          </Form>
        ) : (
          <button>Logout</button>
        )}
      </div>
    </Style.Wrapper>
  );
}
