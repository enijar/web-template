import { appState } from "client/state/app-state.js";
import trpc from "client/services/trpc.js";

export function useAuth() {
  const user = appState((state) => state.user);
  const setUser = appState((state) => state.setUser);
  const login = trpc.login.useMutation();
  const register = trpc.register.useMutation();
  const logout = trpc.logout.useMutation();
  return {
    user,
    async login(data: FormData) {
      setUser(await login.mutateAsync(data));
    },
    async register(data: FormData) {
      setUser(await register.mutateAsync(data));
    },
    async logout() {
      await logout.mutateAsync();
      setUser(null);
    },
  };
}
