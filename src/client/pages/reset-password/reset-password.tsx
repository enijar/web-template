import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import * as Style from "client/pages/reset-password/reset-password.style.js";
import { errorMessage } from "client/services/errors.js";
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
        <p>
          Your password has been reset. <Link to="/">Log in</Link>
        </p>
      ) : (
        <Form
          onSubmit={async (form) => {
            try {
              setFormError(null);
              await passwordResetComplete.mutateAsync(form.data);
              setDone(true);
            } catch (err) {
              setFormError(errorMessage(err));
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
