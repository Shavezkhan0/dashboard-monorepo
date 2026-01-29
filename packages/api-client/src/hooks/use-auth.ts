import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '../client';
import type { User, LoginRequest, RegisterRequest } from '@dashboard/shared-types';

export function useAuth(client: ApiClient, options?: any) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => client.getCurrentUser(),
    retry: false,
    ...options
  });
}

export function useLogin(client: ApiClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => client.login(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export function useRegister(client: ApiClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => client.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}
