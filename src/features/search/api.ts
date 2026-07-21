import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Task } from "@/features/tasks/api";

interface SearchResult {
  task: Task;
  distance: number;
}

export function useSearchTasks(query: string) {
  return useQuery({
    queryKey: ["search", "tasks", query],
    queryFn: async () => {
      const { data } = await api.get<SearchResult[]>("/search/tasks", {
        params: { q: query },
      });
      return data;
    },
    enabled: query.trim().length > 0,
  });
}
