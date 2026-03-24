"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAdmin: session?.user?.role === "ADMIN",
    isProvider: session?.user?.role === "PROVIDER",
    isRequester: session?.user?.role === "REQUESTER",
    isSquadLeader: session?.user?.role === "SQUAD_LEADER",
  };
}
