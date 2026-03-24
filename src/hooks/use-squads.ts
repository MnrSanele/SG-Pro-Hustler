import { useQuery } from "@tanstack/react-query";

export function useSquads(params: { page?: number; limit?: number } = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  return useQuery({
    queryKey: ["squads", params],
    queryFn: async () => {
      const res = await fetch(`/api/squads?${searchParams}`);
      if (!res.ok) throw new Error("Failed to fetch squads");
      return res.json();
    },
  });
}
