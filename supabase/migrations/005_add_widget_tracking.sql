-- Migration 005: Add widget tracking index for upsert saves
-- This helps the backend efficiently find charts by their original widget ID
-- widgetId is stored inside chart_config JSONB as chart_config->>'widgetId'

CREATE INDEX IF NOT EXISTS idx_charts_widget_id 
  ON charts ((chart_config->>'widgetId'))
  WHERE chart_config->>'widgetId' IS NOT NULL;

COMMENT ON INDEX idx_charts_widget_id IS 
  'Allows efficient lookup of charts by their source widget ID for upsert operations';