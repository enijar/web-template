import { create } from "zustand/react";

type AppState = {
  user: null | { id: number; email: string };
  setUser(user: AppState["user"]): void;
};

export const appState = create<AppState>((setState) => {
  return {
    user: null,
    setUser(user) {
      setState({ user });
    },
  };
});
