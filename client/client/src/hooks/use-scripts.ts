import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertScript } from "@shared/routes";

export function useScripts() {
  return useQuery({
    queryKey: [api.scripts.list.path],
    queryFn: async () => {
      const res = await fetch(api.scripts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch scripts");
      return api.scripts.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateScript() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertScript) => {
      const res = await fetch(api.scripts.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create script");
      }
      return api.scripts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scripts.list.path] });
    },
  });
}

export function useUpdateScript() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; name?: string; content?: string }) => {
      const res = await fetch(buildUrl(api.scripts.update.path, { id }), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update script");
      }
      return api.scripts.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scripts.list.path] });
    },
  });
}
