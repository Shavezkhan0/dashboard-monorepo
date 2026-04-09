/**
 * Dashboard Types (Enhanced)
 * Professional 4-layer architecture support
 */

import { Widget } from './widget';
import { Chart } from './chart';
import { Dataset } from './dataset';

// ============================================================================
// WIDGET TYPES (Enhanced for Chart References)
// ============================================================================

export interface DashboardWidget {
  id: string;

  // Widget type
  type: 'chart' | 'text' | 'image' | 'header' | 'kpi';

  // For chart widgets - reference to charts table
  chartId?: string;

  // Position and size
  position: {
    x: number;
    y: number;
    w: number; // width in grid units
    h: number; // height in grid units
  };

  // Optional overrides for this specific widget instance
  overrides?: {
    title?: string;
    colors?: string[];
    [key: string]: any;
  };

  // For non-chart widgets (text, image, header)
  content?: string; // HTML content
  config?: Record<string, any>;
}

// ============================================================================
// LAYOUT CONFIGURATION
// ============================================================================

export interface LayoutConfig {
  type: 'grid' | 'freeform';
  columns?: number; // For grid layout (e.g., 12 columns)
  rowHeight?: number; // For grid layout (e.g., 100px)
  margin?: [number, number]; // [x, y] margins
  padding?: [number, number]; // [x, y] padding
  breakpoints?: {
    lg: number;
    md: number;
    sm: number;
    xs: number;
  };
}

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

export interface DashboardTheme {
  // Colors
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;

  // Typography
  fontFamily?: string;
  fontSize?: number;

  // Spacing
  widgetSpacing?: number;
  widgetPadding?: number;

  // Borders
  widgetBorderRadius?: number;
  widgetBorderWidth?: number;
  widgetBorderColor?: string;

  // Shadows
  widgetShadow?: string;
}

// ============================================================================
// GLOBAL FILTERS
// ============================================================================

export interface GlobalFilter {
  id: string;
  type: 'date' | 'select' | 'multiselect' | 'range';
  label: string;
  column: string; // Which column in datasets to filter
  value: any;
  options?: any[]; // For select/multiselect
}

// ============================================================================
// DASHBOARD TYPE (Enhanced)
// ============================================================================

export interface Dashboard {
  id: string;
  user_id: string;

  // Basic info
  name: string;
  description?: string | null;

  // Widgets - store references to charts, not data
  widgets: DashboardWidget[];

  // Layout and theme
  layout_config?: LayoutConfig;
  theme?: DashboardTheme;

  // Global filters
  global_filters?: GlobalFilter[];

  // Auto-refresh
  refresh_interval?: number | null; // in seconds

  // Sharing
  is_public?: boolean;
  share_token?: string | null;

  // Organization
  folder?: string | null;
  tags?: string[];

  // Metadata
  thumbnail_url?: string | null;
  view_count?: number;
  last_viewed_at?: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DASHBOARD WITH DATA (For Loading)
// ============================================================================

export interface DashboardWithCharts extends Dashboard {
  charts?: Chart[]; // All charts referenced by widgets
  datasets?: Dataset[]; // All datasets used by those charts
}

// ============================================================================
// INPUT/UPDATE TYPES
// ============================================================================

export interface CreateDashboardInput {
  name: string;
  description?: string;
  widgets?: DashboardWidget[];
  layout_config?: LayoutConfig;
  theme?: DashboardTheme;
  global_filters?: GlobalFilter[];
  refresh_interval?: number;
  is_public?: boolean;
  folder?: string;
  tags?: string[];
}

export interface UpdateDashboardInput {
  name?: string;
  description?: string;
  widgets?: DashboardWidget[];
  layout_config?: LayoutConfig;
  theme?: DashboardTheme;
  global_filters?: GlobalFilter[];
  refresh_interval?: number;
  is_public?: boolean;
  folder?: string;
  tags?: string[];
}

// ============================================================================
// DASHBOARD VERSION (For History)
// ============================================================================

export interface DashboardVersion {
  id: string;
  dashboard_id: string;
  version_number: number;

  // Snapshot
  name: string;
  widgets: DashboardWidget[];
  layout_config?: LayoutConfig;
  theme?: DashboardTheme;

  // Metadata
  created_by?: string | null;
  change_description?: string | null;
  created_at: string;
}

// ============================================================================
// DASHBOARD SHARING
// ============================================================================

export interface DashboardShare {
  id: string;
  dashboard_id: string;
  shared_with_user_id: string;
  permission: 'view' | 'edit' | 'admin';
  created_by?: string | null;
  created_at: string;
}