import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface LoginInput {
  email: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface MeResponse {
  id: number;
  email: string;
  created_at: string;
}

interface RegisterInput {
  email: string;
  password: string;
}

interface UserResponse {
  id: number;
  email: string;
  created_at: string;
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async ({ email, password }: LoginInput) => {
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);

      const { data: tokenData } = await api.post<TokenResponse>(
        "/auth/login",
        form,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );

      const { data: user } = await api.get<MeResponse>("/auth/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      setAuth(tokenData.access_token, user);
      return user;
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const { data } = await api.post<UserResponse>("/auth/register", input);
      return data;
    },
  });
}
