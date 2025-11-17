-- Migration: Add channel_snapshots table for algorithm scores
-- Date: 2025-01-17

CREATE TABLE IF NOT EXISTS channel_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id VARCHAR(255) NOT NULL,

    -- Algorithm Score (stored as JSONB for flexibility)
    algorithm_score JSONB NOT NULL,

    -- Snapshot metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Index for fast lookups
    UNIQUE(channel_id, created_at)
);

CREATE INDEX IF NOT EXISTS idx_channel_snapshots_channel_id ON channel_snapshots(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_snapshots_created_at ON channel_snapshots(created_at DESC);

COMMENT ON TABLE channel_snapshots IS 'Stores algorithm scores for channel recommendation snapshots';
