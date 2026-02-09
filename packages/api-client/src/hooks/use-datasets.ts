/**
 * Dataset Hooks
 * React Query hooks for dataset operations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import type { Dataset, CreateDatasetInput, UpdateDatasetInput } from '@dashboard/shared-types';
import { ApiClient } from '../client';

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get all datasets for the authenticated user
 */
export const useDatasets = (options?: UseQueryOptions<Dataset[]>) => {
    return useQuery({
        queryKey: ['datasets'],
        queryFn: async () => {
            const client = new ApiClient();
            return await client.getDatasets();
        },
        ...options,
    });
};

/**
 * Get a single dataset by ID
 */
export const useDataset = (id: string, options?: UseQueryOptions<Dataset>) => {
    return useQuery({
        queryKey: ['datasets', id],
        queryFn: async () => {
            const client = new ApiClient();
            return await client.getDatasetById(id);
        },
        enabled: !!id,
        ...options,
    });
};

/**
 * Get dataset preview (first 100 rows)
 */
export const useDatasetPreview = (id: string, options?: UseQueryOptions<any>) => {
    return useQuery({
        queryKey: ['datasets', id, 'preview'],
        queryFn: async () => {
            const client = new ApiClient();
            return await client.getDatasetPreview(id);
        },
        enabled: !!id,
        ...options,
    });
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create a new dataset
 */
export const useCreateDataset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateDatasetInput) => {
            const client = new ApiClient();
            return await client.createDataset(input);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['datasets'] });
        },
    });
};

/**
 * Update an existing dataset
 */
export const useUpdateDataset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, input }: { id: string; input: UpdateDatasetInput }) => {
            const client = new ApiClient();
            return await client.updateDataset(id, input);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['datasets'] });
            queryClient.invalidateQueries({ queryKey: ['datasets', variables.id] });
        },
    });
};

/**
 * Delete a dataset
 */
export const useDeleteDataset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const client = new ApiClient();
            return await client.deleteDataset(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['datasets'] });
        },
    });
};

/**
 * Upload CSV file and create dataset
 */
export const useUploadCSV = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ file, name }: { file: File; name?: string }) => {
            const client = new ApiClient();
            return await client.uploadCSV(file, name);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['datasets'] });
        },
    });
};