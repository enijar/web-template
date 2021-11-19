import create from "zustand";
import type { User } from "@/types";

export type UserState = {
  authenticating: boolean;
  setAuthenticating: Function;
  user: User | null;
  setUser: (user: User | null) => void;
};

export const useAuth = create<UserState>((set) => {
  return {
    authenticating: true,
    setAuthenticating(authenticating: boolean) {
      set({ authenticating });
    },
    user: null,
    setUser(user: User | null) {
      set({ user });
    },
  };
});
