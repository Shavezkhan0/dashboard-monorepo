import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '../client';
import type {
  DataSource,
  CreateDataSourceInput,
  UpdateDataSourceInput,
} from '@dashboard/shared-types';

export function useDataSources(client: ApiClient) {
  return useQuery({
    queryKey: ['data-sources'],
    queryFn: () => client.getDataSources(),
  });
}

export function useDataSource(client: ApiClient, id: string | null) {
  return useQuery({
    queryKey: ['data-source', id],
    queryFn: () => client.getDataSource(id!),
    enabled: !!id,
  });
}

export function useDataSourceData(client: ApiClient, id: string | null) {
  return useQuery({
    queryKey: ['data-source', id, 'data'],
    queryFn: () => client.getDataSourceData(id!),
    enabled: !!id,
  });
}

export function useCreateDataSource(client: ApiClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDataSourceInput) => client.createDataSource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
    },
  });
}

export function useUpdateDataSource(client: ApiClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateDataSourceInput;
    }) => client.updateDataSource(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
      queryClient.invalidateQueries({
        queryKey: ['data-source', variables.id],
      });
    },
  });
}

export function useDeleteDataSource(client: ApiClient) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.deleteDataSource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-sources'] });
    },
  });
}
