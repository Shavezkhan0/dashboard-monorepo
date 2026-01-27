import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '../client';
import type {
  Dashboard,
  CreateDashboardInput,
  UpdateDashboardInput,
} from '@dashboard/shared-types';

export function useDashboards(client: ApiClient) {
  return useQuery({
    queryKey: ['dashboards'],
    queryFn: () => client.getDashboards(),
  });
}

export function useDashboard(client: ApiClient, id: string | null) {
  return useQuery({
    queryKey: ['dashboard', id],
    queryFn: () => client.getDashboard(id!),
    enabled: !!id,
  });
}

export function useCreateDashboard(client: ApiClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDashboardInput) => client.createDashboard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
  });
}

export function useUpdateDashboard(client: ApiClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateDashboardInput;
    }) => client.updateDashboard(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.id] });
    },
  });
}

export function useDeleteDashboard(client: ApiClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.deleteDashboard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
  });
}
