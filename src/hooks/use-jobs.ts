import { useQuery } from "@tanstack/react-query";

interface JobSearchParams {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
}

export function useJobs(params: JobSearchParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.q) searchParams.set("q", params.q);
  if (params.category) searchParams.set("category", params.category);

  return useQuery({
    queryKey: ["jobs", params],
    queryFn: async () => {
      const res = await fetch(`/api/jobs?${searchParams}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    },
  });
}
