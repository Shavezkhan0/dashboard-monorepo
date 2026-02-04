import type {
  ApiResponse,
  ApiError,
  Dashboard,
  CreateDashboardInput,
  UpdateDashboardInput,
  DataSource,
  CreateDataSourceInput,
  UpdateDataSourceInput,
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  AdminStats,
} from '@dashboard/shared-types';

export class ApiClient {
  private baseUrl: string;
  private getAuthToken: () => string | null;

  constructor(baseUrl: string, getAuthToken?: () => string | null) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.getAuthToken = getAuthToken || (() => null);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken();

    const headers = new Headers(options.headers);

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: 'Unknown Error',
        message: response.statusText,
        statusCode: response.status,
      }));
      throw new Error(error.message || error.error);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const data: ApiResponse<T> = await response.json();
    return data.data;
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  // Dashboard methods
  async getDashboards(): Promise<Dashboard[]> {
    return this.request<Dashboard[]>('/api/dashboards');
  }

  async getDashboard(id: string): Promise<Dashboard> {
    return this.request<Dashboard>(`/api/dashboards/${id}`);
  }

  async createDashboard(data: CreateDashboardInput): Promise<Dashboard> {
    return this.request<Dashboard>('/api/dashboards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDashboard(
    id: string,
    data: UpdateDashboardInput
  ): Promise<Dashboard> {
    return this.request<Dashboard>(`/api/dashboards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDashboard(id: string): Promise<void> {
    return this.request<void>(`/api/dashboards/${id}`, {
      method: 'DELETE',
    });
  }

  // Data Source methods
  async getDataSources(): Promise<DataSource[]> {
    return this.request<DataSource[]>('/api/data-sources');
  }

  async getDataSource(id: string): Promise<DataSource> {
    return this.request<DataSource>(`/api/data-sources/${id}`);
  }

  async createDataSource(data: CreateDataSourceInput): Promise<DataSource> {
    return this.request<DataSource>('/api/data-sources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDataSource(
    id: string,
    data: UpdateDataSourceInput
  ): Promise<DataSource> {
    return this.request<DataSource>(`/api/data-sources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDataSource(id: string): Promise<void> {
    return this.request<void>(`/api/data-sources/${id}`, {
      method: 'DELETE',
    });
  }

  async getDataSourceData(id: string): Promise<any> {
    return this.request<any>(`/api/data-sources/${id}/data`);
  }

  // Admin methods
  async getAdminStats(): Promise<AdminStats> {
    return this.request<AdminStats>('/api/admin/stats');
  }

  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>('/api/admin/users');
  }

  async getAllDashboards(): Promise<Dashboard[]> {
    return this.request<Dashboard[]>('/api/admin/dashboards');
  }
}
