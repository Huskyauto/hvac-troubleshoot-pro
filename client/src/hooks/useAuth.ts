import { trpc } from "../lib/trpc";

export function useAuth() {
  const { data: user, isLoading, error } = trpc.auth.me.useQuery();

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
