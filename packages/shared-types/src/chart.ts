/**
 * Chart Types
 * Represents visualization definitions that reference datasets
 */

export type ChartType =
    | 'bar'
    | 'column'
    | 'line'
    | 'area'
    | 'pie'
    | 'donut'
    | 'scatter'
    | 'bubble'
    | 'funnel'
    | 'gauge'
    | 'kpi'
    | 'treemap'
    | 'waterfall'
    | 'histogram'
    | 'heatmap';

export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'first' | 'last';

export type SortOrder = 'asc' | 'desc';

export interface DataMappingFilter {
    column: string;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains';
    value: any;
}

export interface DataMapping {
    // Axis mappings
    x?: string; // Column name for X-axis
    y?: string | string[]; // Column name(s) for Y-axis

    // Additional mappings for specific chart types
    category?: string; // For pie/donut charts
    value?: string; // For pie/donut/gauge charts
    groupBy?: string; // Group/split data by this column

    // Data transformations
    filters?: DataMappingFilter[];
    aggregation?: Record<string, AggregationType>; // { "revenue": "sum", "orders": "count" }

    // Sorting
    sortBy?: string;
    sortOrder?: SortOrder;
    limit?: number; // Limit number of data points
}

export interface ChartConfig {
    // Title and labels
    title?: string;
    subtitle?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;

    // Colors
    colors?: string[]; // Array of hex colors
    colorScheme?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'rainbow';

    // Legend
    showLegend?: boolean;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right';

    // Data labels
    showDataLabels?: boolean;
    dataLabelPosition?: 'center' | 'top' | 'bottom' | 'inside' | 'outside';

    // Grid and axes
    showGrid?: boolean;
    showXAxis?: boolean;
    showYAxis?: boolean;

    // Chart-specific options
    orientation?: 'horizontal' | 'vertical';
    stacked?: boolean;
    smooth?: boolean; // For line/area charts
    fillArea?: boolean; // For line charts

    // Interactivity
    showTooltip?: boolean;
    animation?: boolean;
    clickable?: boolean;

    // Chart library-specific options (Chart.js, ApexCharts, etc.)
    options?: Record<string, any>;
}

export interface Chart {
    id: string;
    user_id: string;
    dataset_id: string; // Foreign key to datasets table

    // Identity
    name: string;
    description?: string | null;
    type: ChartType;

    // Configuration
    data_mapping: DataMapping;
    chart_config: ChartConfig;

    // Template functionality
    is_template?: boolean;
    template_category?: string | null;

    // Organization
    tags?: string[];
    folder?: string | null;

    // Timestamps
    created_at: string;
    updated_at: string;
}

export interface CreateChartInput {
    name: string;
    description?: string;
    dataset_id: string;
    type: ChartType;
    data_mapping: DataMapping;
    chart_config?: ChartConfig;
    is_template?: boolean;
    template_category?: string;
    tags?: string[];
    folder?: string;
}

export interface UpdateChartInput {
    name?: string;
    description?: string;
    type?: ChartType;
    data_mapping?: DataMapping;
    chart_config?: ChartConfig;
    is_template?: boolean;
    template_category?: string;
    tags?: string[];
    folder?: string;
}

// Helper type for chart rendering
export interface ChartWithData extends Chart {
    dataset?: {
        id: string;
        name: string;
        data: Record<string, any>[];
        columns: Array<{ name: string; type: string }>;
    };
}

// Predefined chart templates
export interface ChartTemplate {
    id: string;
    name: string;
    description: string;
    type: ChartType;
    category: string;
    thumbnail?: string;
    data_mapping: Partial<DataMapping>;
    chart_config: Partial<ChartConfig>;
}