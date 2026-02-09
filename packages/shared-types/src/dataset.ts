/**
 * Dataset Types
 * Represents data storage layer - actual rows and columns
 */

export type ColumnType = 'string' | 'number' | 'date' | 'boolean';

export interface DatasetColumn {
    name: string;
    type: ColumnType;
    format?: string; // e.g., "currency", "percentage", "YYYY-MM-DD"
    nullable?: boolean;
}

export interface DatasetFilter {
    column: string;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith';
    value: any;
}

export interface Dataset {
    id: string;
    user_id: string;
    data_source_id?: string | null;

    // Identity
    name: string;
    description?: string | null;

    // Data storage
    data: Record<string, any>[]; // Array of row objects
    columns: DatasetColumn[];

    // Metadata
    row_count?: number;

    // Refresh settings
    refresh_schedule?: string | null; // Cron expression
    auto_refresh?: boolean;
    last_refreshed_at?: string | null;

    // Organization
    tags?: string[];
    folder?: string | null;

    // Timestamps
    created_at: string;
    updated_at: string;
}

export interface CreateDatasetInput {
    name: string;
    description?: string;
    data: Record<string, any>[];
    columns: DatasetColumn[];
    data_source_id?: string;
    refresh_schedule?: string;
    auto_refresh?: boolean;
    tags?: string[];
    folder?: string;
}

export interface UpdateDatasetInput {
    name?: string;
    description?: string;
    data?: Record<string, any>[];
    columns?: DatasetColumn[];
    refresh_schedule?: string;
    auto_refresh?: boolean;
    tags?: string[];
    folder?: string;
}

// Helper type for CSV parsing
export interface CSVParseResult {
    data: Record<string, any>[];
    columns: DatasetColumn[];
    errors?: string[];
}