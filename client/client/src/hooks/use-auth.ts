import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useState, useEffect } from "react";

const AUTH_KEY = "luacrypt_auth";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple client-side persistence for this demo
    const saved = sessionStorage.getItem(AUTH_KEY);
    if (saved === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (password: string) => {
      const res = await fetch(api.auth.verify.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      
      if (!res.ok) throw new Error("Invalid password");
      return res.json();
    },
    onSuccess: () => {
      sessionStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
      window.location.href = "/"; // Force navigation
    },
  });

  return {
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    isPending: loginMutation.isPending,
    error: loginMutation.error,
  };
}
