import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Project {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

interface ProjectCreateInput {
  name: string;
  description?: string;
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await api.get<Project[]>("/projects");
      return data;
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ProjectCreateInput) => {
      const { data } = await api.post<Project>("/projects", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
