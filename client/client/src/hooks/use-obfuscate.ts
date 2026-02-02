import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useObfuscate() {
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/obfuscate", { code });
      return res.json();
    },
  });
}
