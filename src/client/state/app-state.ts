import { create } from "zustand/react";

type AppState = {
  user: null | { id: number };
  setUser(user: AppState["user"]): void;
};

export const appState = create<AppState>((setState, getState) => {
  return {
    user: null,
    setUser(user) {
      setState({ user });
    },
  };
});
