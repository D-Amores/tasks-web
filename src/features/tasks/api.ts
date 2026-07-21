import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  project_id: number;
  created_at: string;
}

export function useTasks(projectId: number) {
  return useQuery({
    queryKey: ["projects", projectId, "tasks"],
    queryFn: async () => {
      const { data } = await api.get<Task[]>(`/projects/${projectId}/tasks`);
      return data;
    },
  });
}

export function useCreateTask(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const { data } = await api.post<Task>(`/projects/${projectId}/tasks`, {
        title,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "tasks"],
      });
    },
  });
}

export function useToggleTask(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      completed,
    }: {
      taskId: number;
      completed: boolean;
    }) => {
      const { data } = await api.patch<Task>(
        `/projects/${projectId}/tasks/${taskId}`,
        { completed },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "tasks"],
      });
    },
  });
}

export function useDeleteTask(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: number) => {
      await api.delete(`/projects/${projectId}/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "tasks"],
      });
    },
  });
}
