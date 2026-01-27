import { Widget } from './widget';

export interface Dashboard {
  id: string;
  name: string;
  userId: string;
  widgets: Widget[];
  layout?: Record<string, any>;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDashboardInput {
  name: string;
  widgets?: Widget[];
  isPublic?: boolean;
}

export interface UpdateDashboardInput {
  name?: string;
  widgets?: Widget[];
  isPublic?: boolean;
}
