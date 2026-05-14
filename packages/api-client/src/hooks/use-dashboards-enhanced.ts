/**
 * Dashboard Hooks (Enhanced)
 * React Query hooks for dashboard operations with chart/dataset loading
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import type {
    Dashboard,
    CreateDashboardInput,
    UpdateDashboardInput,
    DashboardWithCharts
} from '@dashboard/shared-types';
import { ApiClient } from '../client';

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get all dashboards for the authenticated user
 * @param filters - Optional filters (folder, tag)
 */
export const useDashboards = (filters?: { folder?: string; tag?: string }) => {
    return useQuery({
        queryKey: ['dashboards', filters],
        queryFn: async () => {
            const client = new ApiClient();
            return await client.getDashboards(filters);
        },
    });
};

/**
 * Get a single dashboard by ID
 */
export const useDashboard = (id: string, options?: UseQueryOptions<Dashboard>) => {
    return useQuery({
        queryKey: ['dashboards', id],
        queryFn: async () => {
            const client = new ApiClient();
            const res = await client.getDashboardById(id);
            return res;
        },
        enabled: !!id,
        ...options,
    });
};

/**
 * Get dashboard with all associated charts and datasets
 * This is the main hook for rendering dashboards with data
 */
export const useDashboardWithData = (id: string, options?: Omit<UseQueryOptions<DashboardWithCharts, Error, DashboardWithCharts, any>, 'queryKey'>) => {
    return useQuery<DashboardWithCharts, Error>({
        queryKey: ['dashboards', id, 'with-data'],
        queryFn: async () => {
            const client = new ApiClient();
            return await client.getDashboardWithData(id);
        },
        enabled: !!id,
        ...options as any,
    });
};

/**
 * Get public dashboard by share token (no auth required)
 */
export const usePublicDashboard = (shareToken: string, options?: UseQueryOptions<Dashboard>) => {
    return useQuery({
        queryKey: ['dashboards', 'public', shareToken],
        queryFn: async () => {
            const client = new ApiClient();
            return await client.getPublicDashboard(shareToken);
        },
        enabled: !!shareToken,
        ...options,
    });
};

/**
 * Get dashboard version history
 */
export const useDashboardVersions = (id: string, options?: UseQueryOptions<any[]>) => {
    return useQuery({
        queryKey: ['dashboards', id, 'versions'],
        queryFn: async () => {
            const client = new ApiClient();
            return await client.getDashboardVersions(id);
        },
        enabled: !!id,
        ...options,
    });
};

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create a new dashboard
 */
export const useCreateDashboard = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateDashboardInput) => {
            const client = new ApiClient();
            return await client.createDashboard(input);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboards'] });
        },
    });
};

/**
 * Update an existing dashboard
 */
export const useUpdateDashboard = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, input }: { id: string; input: UpdateDashboardInput }) => {
            const client = new ApiClient();
            return await client.updateDashboard(id, input);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['dashboards'] });
            queryClient.invalidateQueries({ queryKey: ['dashboards', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['dashboards', variables.id, 'with-data'] });
        },
    });
};

/**
 * Delete a dashboard
 */
export const useDeleteDashboard = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const client = new ApiClient();
            return await client.deleteDashboard(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboards'] });
        },
    });
};

/**
 * Clone a dashboard
 */
export const useCloneDashboard = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, name }: { id: string; name?: string }) => {
            const client = new ApiClient();
            return await client.cloneDashboard(id, name);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboards'] });
        },
    });
};

/**
 * Restore dashboard to a previous version
 */
export const useRestoreDashboardVersion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, version_number }: { id: string; version_number: number }) => {
            const client = new ApiClient();
            return await client.restoreDashboardVersion(id, version_number);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['dashboards', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['dashboards', variables.id, 'with-data'] });
            queryClient.invalidateQueries({ queryKey: ['dashboards', variables.id, 'versions'] });
        },
    });
};