/**
 * Chart Hooks
 * React Query hooks for chart operations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import type { Chart, CreateChartInput, UpdateChartInput, ChartWithData } from '@dashboard/shared-types';
import { ApiClient } from '../client';

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get all charts for the authenticated user
 * @param filters - Optional filters (dataset_id, type, is_template)
 */
export const useCharts = (filters?: { dataset_id?: string; type?: string; is_template?: string }) => {
    return useQuery({
        queryKey: ['charts', filters],
        queryFn: async () => {
            const client = new ApiClient();
            return await client.getCharts(filters);
        },
    });
};

/**
 * Get a single chart by ID
 */
export const useChart = (id: string, options?: UseQueryOptions<Chart>) => {
    return useQuery({
        queryKey: ['charts', id],
        queryFn: async () => {
            const client = new ApiClient();
            return await client.getChartById(id);
        },
        enabled: !!id,
        ...options,
    });
};

/**
 * Get chart with its associated dataset
 */
export const useChartWithData = (id: string, options?: UseQueryOptions<ChartWithData>) => {
    return useQuery({
        queryKey: ['charts', id, 'with-data'],
        queryFn: async () => {
            const client = new ApiClient();
            return await client.getChartWithData(id);
        },
        enabled: !!id,
        ...options,
    });
};

/**
 * Get all chart templates
 */
export const useChartTemplates = (category?: string) => {
    return useQuery({
        queryKey: ['charts', 'templates', category],
        queryFn: async () => {
            const client = new ApiClient();
            return await client.getChartTemplates(category);
        },
    });
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create a new chart
 */
export const useCreateChart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateChartInput) => {
            const client = new ApiClient();
            return await client.createChart(input);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['charts'] });
        },
    });
};

/**
 * Update an existing chart
 */
export const useUpdateChart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, input }: { id: string; input: UpdateChartInput }) => {
            const client = new ApiClient();
            return await client.updateChart(id, input);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['charts'] });
            queryClient.invalidateQueries({ queryKey: ['charts', variables.id] });
            // Also invalidate dashboards that might use this chart
            queryClient.invalidateQueries({ queryKey: ['dashboards'] });
        },
    });
};

/**
 * Delete a chart
 */
export const useDeleteChart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const client = new ApiClient();
            return await client.deleteChart(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['charts'] });
            queryClient.invalidateQueries({ queryKey: ['dashboards'] });
        },
    });
};

/**
 * Clone a chart (useful for templates)
 */
export const useCloneChart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, dataset_id, name }: { id: string; dataset_id?: string; name?: string }) => {
            const client = new ApiClient();
            return await client.cloneChart(id, dataset_id, name);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['charts'] });
        },
    });
};