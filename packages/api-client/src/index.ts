export { ApiClient } from './client';
export * from './hooks/use-dashboards';
export * from './hooks/use-auth';
export * from './hooks/use-data-sources';
export * from './hooks/use-admin';

// ADD these 3 new lines:
export * from './hooks/use-datasets';
export * from './hooks/use-charts';
export { useDashboardWithData, usePublicDashboard, useDashboardVersions } from './hooks/use-dashboards-enhanced';