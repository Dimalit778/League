import { useAppStore } from "@/store/useAppStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { authKeys } from "./keys";

export const useLoginMutation = () => {
  const { login } = useAuth();
  
  return useMutation({
    mutationKey: authKeys.login(),
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return await login(email, password);
    },
  });
};

export const useRegisterMutation = () => {
  const { register } = useAuth();
  
  return useMutation({
    mutationKey: authKeys.register(),
    mutationFn: async ({ email, password, fullname }: { email: string; password: string; fullname: string }) => {
      return await register(email, password, fullname);
    },
  });
};

export const useLogoutMutation = () => {
  const { logout } = useAuth();
  
  return useMutation({
    mutationKey: authKeys.logout(),
    mutationFn: async () => {
      return await logout();
    },
  });
};

export const useSessionQuery = (enabled = true) => {
  const { initializeSession, session } = useAppStore();
  
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: async () => {
      return await initializeSession();
    },
    enabled,
  });
};
