import type {
  ApiResponse,
  ApiError,
  Dashboard,
  CreateDashboardInput,
  UpdateDashboardInput,
  DashboardWithCharts,
  DataSource,
  CreateDataSourceInput,
  UpdateDataSourceInput,
  Dataset,
  CreateDatasetInput,
  UpdateDatasetInput,
  Chart,
  CreateChartInput,
  UpdateChartInput,
  ChartWithData,
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  AdminStats,
} from '@dashboard/shared-types';

export class ApiClient {
  private baseUrl: string;
  private getAuthToken: () => string | null;

  constructor(baseUrl?: string, getAuthToken?: () => string | null) {
    this.baseUrl = (baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
    this.getAuthToken = getAuthToken || (() => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
      }
      return null;
    });
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

  // ============================================================================
  // AUTH METHODS
  // ============================================================================

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

  // ============================================================================
  // DATASET METHODS
  // ============================================================================

  async getDatasets(): Promise<Dataset[]> {
    return this.request<Dataset[]>('/api/datasets');
  }

  async getDatasetById(id: string): Promise<Dataset> {
    return this.request<Dataset>(`/api/datasets/${id}`);
  }

  async getDatasetPreview(id: string): Promise<any> {
    return this.request<any>(`/api/datasets/${id}/preview`);
  }

  async createDataset(data: CreateDatasetInput): Promise<Dataset> {
    return this.request<Dataset>('/api/datasets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDataset(id: string, data: UpdateDatasetInput): Promise<Dataset> {
    return this.request<Dataset>(`/api/datasets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDataset(id: string): Promise<void> {
    return this.request<void>(`/api/datasets/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadCSV(file: File, name?: string, description?: string): Promise<Dataset> {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    if (description) formData.append('description', description);

    const token = this.getAuthToken();
    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${this.baseUrl}/api/datasets/upload/csv`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    return data.data;
  }

  // ============================================================================
  // CHART METHODS
  // ============================================================================

  async getCharts(filters?: { dataset_id?: string; type?: string; is_template?: string }): Promise<Chart[]> {
    const params = new URLSearchParams();
    if (filters?.dataset_id) params.set('dataset_id', filters.dataset_id);
    if (filters?.type) params.set('type', filters.type);
    if (filters?.is_template) params.set('is_template', filters.is_template);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Chart[]>(`/api/charts${query}`);
  }

  async getChartById(id: string): Promise<Chart> {
    return this.request<Chart>(`/api/charts/${id}`);
  }

  async getChartWithData(id: string): Promise<ChartWithData> {
    return this.request<ChartWithData>(`/api/charts/${id}/with-data`);
  }

  async getChartTemplates(category?: string): Promise<Chart[]> {
    const query = category ? `?category=${category}` : '';
    return this.request<Chart[]>(`/api/charts/templates${query}`);
  }

  async createChart(data: CreateChartInput): Promise<Chart> {
    return this.request<Chart>('/api/charts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateChart(id: string, data: UpdateChartInput): Promise<Chart> {
    return this.request<Chart>(`/api/charts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteChart(id: string): Promise<void> {
    return this.request<void>(`/api/charts/${id}`, {
      method: 'DELETE',
    });
  }

  async cloneChart(id: string, dataset_id?: string, name?: string): Promise<Chart> {
    return this.request<Chart>(`/api/charts/${id}/clone`, {
      method: 'POST',
      body: JSON.stringify({ dataset_id, name }),
    });
  }

  // ============================================================================
  // DASHBOARD METHODS (Enhanced)
  // ============================================================================

  async getDashboards(filters?: { folder?: string; tag?: string }): Promise<Dashboard[]> {
    const params = new URLSearchParams();
    if (filters?.folder) params.set('folder', filters.folder);
    if (filters?.tag) params.set('tag', filters.tag);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<Dashboard[]>(`/api/dashboards${query}`);
  }

  async getDashboardById(id: string): Promise<Dashboard> {
    return this.request<Dashboard>(`/api/dashboards/${id}`);
  }

  async getDashboardWithData(id: string): Promise<DashboardWithCharts> {
    return this.request<DashboardWithCharts>(`/api/dashboards/${id}/with-data`);
  }

  async getPublicDashboard(shareToken: string): Promise<Dashboard> {
    return this.request<Dashboard>(`/api/dashboards/public/${shareToken}`);
  }

  async createDashboard(data: CreateDashboardInput): Promise<Dashboard> {
    return this.request<Dashboard>('/api/dashboards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDashboard(id: string, data: UpdateDashboardInput): Promise<Dashboard> {
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

  async cloneDashboard(id: string, name?: string): Promise<Dashboard> {
    return this.request<Dashboard>(`/api/dashboards/${id}/clone`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async getDashboardVersions(id: string): Promise<any[]> {
    return this.request<any[]>(`/api/dashboards/${id}/versions`);
  }

  async restoreDashboardVersion(id: string, version_number: number): Promise<Dashboard> {
    return this.request<Dashboard>(`/api/dashboards/${id}/restore-version`, {
      method: 'POST',
      body: JSON.stringify({ version_number }),
    });
  }

  // ============================================================================
  // DATA SOURCE METHODS
  // ============================================================================

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

  async updateDataSource(id: string, data: UpdateDataSourceInput): Promise<DataSource> {
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

  // ============================================================================
  // ADMIN METHODS
  // ============================================================================

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
