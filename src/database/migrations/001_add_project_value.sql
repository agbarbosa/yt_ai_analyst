-- Migration: Add project_value column to recommendations table
-- Date: 2025-01-17

ALTER TABLE recommendations
ADD COLUMN IF NOT EXISTS project_value INTEGER CHECK (project_value >= 0 AND project_value <= 100);

-- Add index for sorting by project value
CREATE INDEX IF NOT EXISTS idx_recommendations_project_value ON recommendations(project_value DESC NULLS LAST);
