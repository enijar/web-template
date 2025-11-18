import React from "react";
import { TRPCClientError } from "@trpc/client";
import { appState } from "client/state/app-state";
import trpc from "client/services/trpc";

export default function Home() {
  const user = appState((state) => state.user);
  const login = trpc.login.useMutation();
  const [formError, setFormError] = React.useState<string | null>(null);
  return (
    <main>
      <h1>Home</h1>
      <div>
        {user === null ? (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              const form = event.currentTarget;
              try {
                setFormError(null);
                await login.mutateAsync(new FormData(form));
                form.reset();
              } catch (err) {
                setFormError(err instanceof TRPCClientError ? err.message : "Something went wrong");
              }
            }}
          >
            {formError !== null && <pre>{formError}</pre>}
            <input type="email" name="email" />
            <input type="password" name="password" />
            <button>Login</button>
          </form>
        ) : (
          <button>Logout</button>
        )}
      </div>
    </main>
  );
}
