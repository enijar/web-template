import React from "react";
import { useSearchParams } from "react-router-dom";
import { TRPCClientError } from "@trpc/client";
import * as Style from "client/pages/reset-password/reset-password.style.js";
import trpc from "client/services/trpc.js";
import Form from "client/components/form/form.js";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const passwordResetComplete = trpc.passwordResetComplete.useMutation();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  return (
    <Style.Wrapper>
      <h1>Reset password</h1>
      {done ? (
        <p>Your password has been reset. You can now log in.</p>
      ) : (
        <Form
          onSubmit={async (form) => {
            try {
              setFormError(null);
              await passwordResetComplete.mutateAsync(form.data);
              setDone(true);
            } catch (err) {
              setFormError(err instanceof TRPCClientError ? err.message : "Something went wrong");
            }
          }}
        >
          {formError !== null && <pre>{formError}</pre>}
          <input type="hidden" name="token" defaultValue={token} />
          <label htmlFor="password">New password</label>
          <input id="password" type="password" name="password" autoComplete="new-password" />
          <button>Reset password</button>
        </Form>
      )}
    </Style.Wrapper>
  );
}
