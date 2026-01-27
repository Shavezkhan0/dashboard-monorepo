import { useQuery } from '@tanstack/react-query';
import { ApiClient } from '../client';
import type { User, Dashboard, AdminStats } from '@dashboard/shared-types';

export function useAdminStats(client: ApiClient) {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => client.getAdminStats(),
  });
}

export function useAllUsers(client: ApiClient) {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => client.getAllUsers(),
  });
}

export function useAllDashboards(client: ApiClient) {
  return useQuery({
    queryKey: ['admin', 'dashboards'],
    queryFn: () => client.getAllDashboards(),
  });
}
