import { Dashboard, CreateDashboardInput, UpdateDashboardInput } from './dashboard';
import { DataSource, CreateDataSourceInput, UpdateDataSourceInput } from './data-source';
import { User } from './user';

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// Auth API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Dashboard API
export type DashboardListResponse = ApiResponse<Dashboard[]>;
export type DashboardResponse = ApiResponse<Dashboard>;
export type CreateDashboardRequest = CreateDashboardInput;
export type UpdateDashboardRequest = UpdateDashboardInput;

// Data Source API
export type DataSourceListResponse = ApiResponse<DataSource[]>;
export type DataSourceResponse = ApiResponse<DataSource>;
export type CreateDataSourceRequest = CreateDataSourceInput;
export type UpdateDataSourceRequest = UpdateDataSourceInput;

// Admin API
export interface AdminStats {
  totalUsers: number;
  totalDashboards: number;
  totalDataSources: number;
  recentActivity: any[];
}

export type AdminStatsResponse = ApiResponse<AdminStats>;
