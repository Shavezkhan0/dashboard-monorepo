export type DataSourceType = 'csv' | 'api' | 'database' | 'manual';

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  userId: string;
  connectionString?: string;
  data?: any;
  config?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDataSourceInput {
  name: string;
  type: DataSourceType;
  connectionString?: string;
  data?: any;
  config?: Record<string, any>;
}

export interface UpdateDataSourceInput {
  name?: string;
  connectionString?: string;
  data?: any;
  config?: Record<string, any>;
}
