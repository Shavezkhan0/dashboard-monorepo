-- ============================================================================
-- PROFESSIONAL DASHBOARD ARCHITECTURE - SUPABASE MIGRATION
-- Version: 1.0
-- Date: February 2026
-- Description: Industry-standard 4-layer architecture for dashboard platform
-- ============================================================================

-- ============================================================================
-- LAYER 1: DATA SOURCES (Already exists, enhance if needed)
-- ============================================================================

-- Check if data_sources table exists, if not create it
CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('csv', 'postgresql', 'mysql', 'api', 'manual', 'excel')),
  
  -- Connection details (store encrypted in production)
  connection_config JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'error', 'disabled')),
  last_synced_at TIMESTAMPTZ,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for data_sources if not already enabled
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users view own data sources" ON data_sources;
DROP POLICY IF EXISTS "Users create own data sources" ON data_sources;
DROP POLICY IF EXISTS "Users update own data sources" ON data_sources;
DROP POLICY IF EXISTS "Users delete own data sources" ON data_sources;

-- Create RLS policies
CREATE POLICY "Users view own data sources"
  ON data_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own data sources"
  ON data_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own data sources"
  ON data_sources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own data sources"
  ON data_sources FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- LAYER 2: DATASETS (Actual Data Storage)
-- ============================================================================

CREATE TABLE datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
  
  -- Dataset identity
  name TEXT NOT NULL,
  description TEXT,
  
  -- Data storage (JSONB array of row objects)
  data JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Schema definition
  columns JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Structure: [
  --   {
  --     "name": "month",
  --     "type": "string",
  --     "format": null,
  --     "nullable": false
  --   },
  --   {
  --     "name": "revenue",
  --     "type": "number",
  --     "format": "currency",
  --     "nullable": false
  --   }
  -- ]
  
  -- Computed metadata
  row_count INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN jsonb_typeof(data) = 'array' THEN jsonb_array_length(data)
      ELSE 0
    END
  ) STORED,
  
  -- Data refresh settings
  refresh_schedule TEXT, -- cron expression: "0 0 * * *" (daily at midnight)
  auto_refresh BOOLEAN DEFAULT false,
  last_refreshed_at TIMESTAMPTZ,
  
  -- Organization
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  folder TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_data CHECK (jsonb_typeof(data) = 'array'),
  CONSTRAINT valid_columns CHECK (jsonb_typeof(columns) = 'array')
);

-- Indexes for performance
CREATE INDEX idx_datasets_user_id ON datasets(user_id);
CREATE INDEX idx_datasets_data_source_id ON datasets(data_source_id);
CREATE INDEX idx_datasets_tags ON datasets USING GIN(tags);
CREATE INDEX idx_datasets_folder ON datasets(folder) WHERE folder IS NOT NULL;
CREATE INDEX idx_datasets_created_at ON datasets(created_at DESC);

-- RLS Policies
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own datasets"
  ON datasets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own datasets"
  ON datasets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own datasets"
  ON datasets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own datasets"
  ON datasets FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- LAYER 3: CHARTS (Visualization Definitions)
-- ============================================================================

CREATE TABLE charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE NOT NULL,
  
  -- Chart identity
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN (
    'bar', 'column', 'line', 'area', 'pie', 'donut', 
    'scatter', 'bubble', 'funnel', 'gauge', 'kpi',
    'treemap', 'waterfall', 'histogram', 'heatmap'
  )),
  
  -- Data mapping configuration
  data_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "x": "month",              // X-axis column name
  --   "y": ["revenue", "profit"], // Y-axis column(s)
  --   "groupBy": "region",       // Optional grouping column
  --   "filters": [               // Optional filters
  --     {
  --       "column": "year",
  --       "operator": "=",
  --       "value": 2024
  --     }
  --   ],
  --   "aggregation": {           // Optional aggregations
  --     "revenue": "sum",
  --     "profit": "avg"
  --   },
  --   "sortBy": "revenue",       // Sort column
  --   "sortOrder": "desc"        // asc or desc
  -- }
  
  -- Visual configuration
  chart_config JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "title": "Monthly Revenue",
  --   "subtitle": "Last 12 months",
  --   "colors": ["#3b82f6", "#ef4444", "#10b981"],
  --   "showLegend": true,
  --   "legendPosition": "bottom",
  --   "showDataLabels": true,
  --   "showGrid": true,
  --   "orientation": "vertical",
  --   "stacked": false,
  --   "showTooltip": true,
  --   "animation": true,
  --   "options": {}  // Chart library-specific options
  -- }
  
  -- Template functionality
  is_template BOOLEAN DEFAULT false,
  template_category TEXT,
  
  -- Organization
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  folder TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_data_mapping CHECK (jsonb_typeof(data_mapping) = 'object'),
  CONSTRAINT valid_chart_config CHECK (jsonb_typeof(chart_config) = 'object')
);

-- Indexes
CREATE INDEX idx_charts_user_id ON charts(user_id);
CREATE INDEX idx_charts_dataset_id ON charts(dataset_id);
CREATE INDEX idx_charts_type ON charts(type);
CREATE INDEX idx_charts_is_template ON charts(is_template) WHERE is_template = true;
CREATE INDEX idx_charts_tags ON charts USING GIN(tags);
CREATE INDEX idx_charts_created_at ON charts(created_at DESC);

-- RLS Policies
ALTER TABLE charts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own charts"
  ON charts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users view template charts"
  ON charts FOR SELECT
  USING (is_template = true);

CREATE POLICY "Users create own charts"
  ON charts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own charts"
  ON charts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own charts"
  ON charts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- LAYER 4: DASHBOARDS (Enhanced)
-- ============================================================================

-- Drop existing dashboards table constraints if needed
ALTER TABLE dashboards DROP CONSTRAINT IF EXISTS dashboards_widgets_check;

-- Add new columns to existing dashboards table
ALTER TABLE dashboards 
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS theme JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS global_filters JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS refresh_interval INTEGER,
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS folder TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ;

-- Update widgets column to store references instead of embedded data
-- Structure of widgets:
-- [
--   {
--     "id": "widget-1",
--     "chartId": "uuid-of-chart",  // Reference to charts table
--     "type": "chart",              // or "text", "image", "header"
--     "position": {
--       "x": 0,
--       "y": 0,
--       "w": 6,
--       "h": 4
--     },
--     "overrides": {                // Optional widget-specific overrides
--       "title": "Custom Title",
--       "colors": ["#custom"]
--     },
--     "content": "<h1>Header</h1>"  // For non-chart widgets
--   }
-- ]

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dashboards_share_token ON dashboards(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dashboards_tags ON dashboards USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_dashboards_folder ON dashboards(folder) WHERE folder IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dashboards_public ON dashboards(is_public) WHERE is_public = true;

-- Update RLS policies
DROP POLICY IF EXISTS "Anyone view public dashboards" ON dashboards;

CREATE POLICY "Anyone view public dashboards"
  ON dashboards FOR SELECT
  USING (is_public = true);

-- ============================================================================
-- SUPPORTING TABLES
-- ============================================================================

-- Dashboard versions for history/undo
CREATE TABLE IF NOT EXISTS dashboard_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  
  -- Snapshot of dashboard state
  name TEXT NOT NULL,
  widgets JSONB NOT NULL,
  layout_config JSONB DEFAULT '{}'::jsonb,
  theme JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(dashboard_id, version_number)
);

CREATE INDEX idx_dashboard_versions_dashboard_id ON dashboard_versions(dashboard_id);
CREATE INDEX idx_dashboard_versions_created_at ON dashboard_versions(created_at DESC);

-- Dashboard sharing for collaboration
CREATE TABLE IF NOT EXISTS dashboard_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission TEXT DEFAULT 'view' CHECK (permission IN ('view', 'edit', 'admin')),
  
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(dashboard_id, shared_with_user_id)
);

CREATE INDEX idx_dashboard_shares_dashboard_id ON dashboard_shares(dashboard_id);
CREATE INDEX idx_dashboard_shares_shared_with ON dashboard_shares(shared_with_user_id);

-- RLS for dashboard_shares
ALTER TABLE dashboard_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view shares where they are shared with"
  ON dashboard_shares FOR SELECT
  USING (auth.uid() = shared_with_user_id);

CREATE POLICY "Dashboard owners manage shares"
  ON dashboard_shares FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM dashboards 
      WHERE dashboards.id = dashboard_shares.dashboard_id 
      AND dashboards.user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
DROP TRIGGER IF EXISTS update_data_sources_updated_at ON data_sources;
CREATE TRIGGER update_data_sources_updated_at
  BEFORE UPDATE ON data_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_datasets_updated_at ON datasets;
CREATE TRIGGER update_datasets_updated_at
  BEFORE UPDATE ON datasets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_charts_updated_at ON charts;
CREATE TRIGGER update_charts_updated_at
  BEFORE UPDATE ON charts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dashboards_updated_at ON dashboards;
CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate share token for public dashboards
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_public = true AND NEW.share_token IS NULL THEN
    NEW.share_token := encode(gen_random_bytes(16), 'hex');
  ELSIF NEW.is_public = false THEN
    NEW.share_token := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_dashboard_share_token ON dashboards;
CREATE TRIGGER generate_dashboard_share_token
  BEFORE INSERT OR UPDATE ON dashboards
  FOR EACH ROW
  EXECUTE FUNCTION generate_share_token();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_dashboard_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dashboards 
  SET 
    view_count = COALESCE(view_count, 0) + 1,
    last_viewed_at = NOW()
  WHERE id = NEW.dashboard_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create dashboard version on update
CREATE OR REPLACE FUNCTION create_dashboard_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  -- Only create version if widgets changed
  IF OLD.widgets IS DISTINCT FROM NEW.widgets OR 
     OLD.layout_config IS DISTINCT FROM NEW.layout_config OR
     OLD.theme IS DISTINCT FROM NEW.theme THEN
    
    -- Get next version number
    SELECT COALESCE(MAX(version_number), 0) + 1 
    INTO next_version
    FROM dashboard_versions
    WHERE dashboard_id = NEW.id;
    
    -- Insert version
    INSERT INTO dashboard_versions (
      dashboard_id,
      version_number,
      name,
      widgets,
      layout_config,
      theme,
      created_by
    ) VALUES (
      NEW.id,
      next_version,
      NEW.name,
      NEW.widgets,
      NEW.layout_config,
      NEW.theme,
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_dashboard_version_trigger ON dashboards;
CREATE TRIGGER create_dashboard_version_trigger
  AFTER UPDATE ON dashboards
  FOR EACH ROW
  EXECUTE FUNCTION create_dashboard_version();

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample dataset
-- INSERT INTO datasets (user_id, name, description, data, columns) VALUES (
--   auth.uid(),
--   'Sample Sales Data',
--   'Monthly sales data for 2024',
--   '[
--     {"month": "January", "revenue": 50000, "region": "North"},
--     {"month": "February", "revenue": 65000, "region": "North"},
--     {"month": "March", "revenue": 70000, "region": "North"}
--   ]'::jsonb,
--   '[
--     {"name": "month", "type": "string"},
--     {"name": "revenue", "type": "number", "format": "currency"},
--     {"name": "region", "type": "string"}
--   ]'::jsonb
-- );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Grant necessary permissions (if using service role)
-- GRANT ALL ON datasets TO authenticated;
-- GRANT ALL ON charts TO authenticated;
-- GRANT ALL ON dashboard_versions TO authenticated;
-- GRANT ALL ON dashboard_shares TO authenticated;

COMMENT ON TABLE datasets IS 'Stores actual data (rows/columns) that power charts';
COMMENT ON TABLE charts IS 'Visualization definitions that reference datasets';
COMMENT ON TABLE dashboards IS 'Dashboard compositions that reference charts by ID';
COMMENT ON TABLE dashboard_versions IS 'Version history for undo/redo functionality';
COMMENT ON TABLE dashboard_shares IS 'Sharing permissions for collaborative dashboards';