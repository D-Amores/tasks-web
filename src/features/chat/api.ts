import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ChatResponse {
  reply: string;
}

export function useSendMessage() {
  return useMutation({
    mutationFn: async (message: string) => {
      const { data } = await api.post<ChatResponse>("/chat", { message });
      return data.reply;
    },
  });
}
