import { useQuery } from "@tanstack/react-query";

interface ProviderSearchParams {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
}

export function useProviders(params: ProviderSearchParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.q) searchParams.set("q", params.q);
  if (params.category) searchParams.set("category", params.category);

  return useQuery({
    queryKey: ["providers", params],
    queryFn: async () => {
      const res = await fetch(`/api/providers?${searchParams}`);
      if (!res.ok) throw new Error("Failed to fetch providers");
      return res.json();
    },
  });
}
