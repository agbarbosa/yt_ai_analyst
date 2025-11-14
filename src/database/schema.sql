-- YouTube AI Analyst Database Schema
-- PostgreSQL schema for structured data

-- ============================================================================
-- CHANNELS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    custom_url VARCHAR(255),

    -- Statistics
    subscriber_count BIGINT DEFAULT 0,
    total_views BIGINT DEFAULT 0,
    video_count INTEGER DEFAULT 0,

    -- Performance Metrics (90-day averages)
    avg_ctr DECIMAL(5,2) DEFAULT 0,
    avg_watch_time INTEGER DEFAULT 0,
    avg_retention_rate DECIMAL(5,2) DEFAULT 0,
    avg_engagement_rate DECIMAL(5,2) DEFAULT 0,

    -- Content Analysis
    primary_topics TEXT[] DEFAULT '{}',
    secondary_topics TEXT[] DEFAULT '{}',
    upload_frequency VARCHAR(50),
    avg_video_length INTEGER DEFAULT 0,
    shorts_percentage DECIMAL(5,2) DEFAULT 0,

    -- Audience Data
    target_audience TEXT,
    primary_demographic JSONB,
    main_traffic_sources JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_channels_channel_id ON channels(channel_id);
CREATE INDEX idx_channels_analyzed_at ON channels(analyzed_at DESC);

-- ============================================================================
-- VIDEOS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id VARCHAR(255) UNIQUE NOT NULL,
    channel_id VARCHAR(255) NOT NULL REFERENCES channels(channel_id) ON DELETE CASCADE,

    -- Basic Info
    title VARCHAR(500) NOT NULL,
    description TEXT,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL,
    is_short BOOLEAN DEFAULT FALSE,

    -- Thumbnail
    thumbnail_url TEXT,
    thumbnail_quality VARCHAR(20),

    -- Performance Metrics
    views BIGINT DEFAULT 0,
    impressions BIGINT DEFAULT 0,
    ctr DECIMAL(5,2) DEFAULT 0,
    avg_view_duration INTEGER DEFAULT 0,
    avg_percentage_viewed DECIMAL(5,2) DEFAULT 0,

    -- Engagement
    likes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    subscribers_gained INTEGER DEFAULT 0,
    subscribers_lost INTEGER DEFAULT 0,

    -- Retention Data
    retention_at_15_seconds DECIMAL(5,2) DEFAULT 0,
    retention_at_25_percent DECIMAL(5,2) DEFAULT 0,
    retention_at_50_percent DECIMAL(5,2) DEFAULT 0,
    retention_at_75_percent DECIMAL(5,2) DEFAULT 0,
    retention_at_90_percent DECIMAL(5,2) DEFAULT 0,
    retention_curve JSONB,

    -- Traffic Sources
    traffic_sources JSONB,
    main_traffic_source VARCHAR(50),

    -- SEO
    tags TEXT[] DEFAULT '{}',
    keywords TEXT[] DEFAULT '{}',
    category VARCHAR(100),

    -- Survey Data
    satisfaction_score DECIMAL(5,2),
    negative_signal_rate DECIMAL(5,2),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_videos_video_id ON videos(video_id);
CREATE INDEX idx_videos_channel_id ON videos(channel_id);
CREATE INDEX idx_videos_published_at ON videos(published_at DESC);
CREATE INDEX idx_videos_analyzed_at ON videos(analyzed_at DESC);
CREATE INDEX idx_videos_is_short ON videos(is_short);

-- ============================================================================
-- ALGORITHM SCORES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS algorithm_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id VARCHAR(255) NOT NULL REFERENCES videos(video_id) ON DELETE CASCADE,

    -- Overall Score
    overall DECIMAL(5,2) NOT NULL,
    grade VARCHAR(3) NOT NULL,

    -- Breakdown
    ctr_score DECIMAL(5,2) NOT NULL,
    watch_time_score DECIMAL(5,2) NOT NULL,
    engagement_score DECIMAL(5,2) NOT NULL,
    satisfaction_score DECIMAL(5,2) NOT NULL,

    -- Analysis
    strengths TEXT[] DEFAULT '{}',
    weaknesses TEXT[] DEFAULT '{}',
    opportunities TEXT[] DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(video_id, created_at)
);

CREATE INDEX idx_algorithm_scores_video_id ON algorithm_scores(video_id);
CREATE INDEX idx_algorithm_scores_overall ON algorithm_scores(overall DESC);

-- ============================================================================
-- RECOMMENDATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_id VARCHAR(255) NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('channel', 'video')),

    -- Categorization
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),

    -- Content
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    action_items JSONB NOT NULL DEFAULT '[]',
    expected_impact JSONB NOT NULL,

    -- AI Generation Info
    generated_by VARCHAR(50) NOT NULL,
    reasoning TEXT NOT NULL,
    prompt TEXT,
    confidence DECIMAL(3,2) DEFAULT 0,

    -- Implementation Tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'implemented', 'dismissed', 'expired')),
    implemented_at TIMESTAMP WITH TIME ZONE,
    implementation_notes TEXT,
    actual_impact JSONB,

    -- User Feedback
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    helpful BOOLEAN,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_recommendations_target ON recommendations(target_id, target_type);
CREATE INDEX idx_recommendations_category ON recommendations(category);
CREATE INDEX idx_recommendations_priority ON recommendations(priority);
CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_recommendations_created_at ON recommendations(created_at DESC);

-- ============================================================================
-- PERFORMANCE GAPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS performance_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_id VARCHAR(255) NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('channel', 'video')),

    category VARCHAR(100) NOT NULL,
    metric VARCHAR(100) NOT NULL,
    current_value DECIMAL(10,2) NOT NULL,
    benchmark_value DECIMAL(10,2) NOT NULL,
    gap DECIMAL(10,2) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    description TEXT NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_performance_gaps_target ON performance_gaps(target_id, target_type);
CREATE INDEX idx_performance_gaps_severity ON performance_gaps(severity);

-- ============================================================================
-- BENCHMARKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric VARCHAR(100) NOT NULL,
    niche VARCHAR(100) NOT NULL,
    channel_size_category VARCHAR(20) NOT NULL CHECK (channel_size_category IN ('nano', 'micro', 'small', 'medium', 'large', 'mega')),

    percentile_25 DECIMAL(10,2) NOT NULL,
    percentile_50 DECIMAL(10,2) NOT NULL,
    percentile_75 DECIMAL(10,2) NOT NULL,
    percentile_90 DECIMAL(10,2) NOT NULL,

    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(metric, niche, channel_size_category)
);

CREATE INDEX idx_benchmarks_lookup ON benchmarks(metric, niche, channel_size_category);

-- ============================================================================
-- ANALYTICS TRENDS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_id VARCHAR(255) NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('channel', 'video')),

    metric VARCHAR(100) NOT NULL,
    time_range VARCHAR(50) NOT NULL,
    data_points JSONB NOT NULL,
    trend VARCHAR(20) CHECK (trend IN ('increasing', 'decreasing', 'stable', 'volatile')),
    percentage_change DECIMAL(10,2),
    insights TEXT[] DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_trends_target ON analytics_trends(target_id, target_type);
CREATE INDEX idx_analytics_trends_metric ON analytics_trends(metric);

-- ============================================================================
-- PROMPT TEMPLATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    version VARCHAR(20) NOT NULL,
    template TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]',
    model VARCHAR(50) NOT NULL,
    temperature DECIMAL(3,2) NOT NULL,
    max_tokens INTEGER NOT NULL,
    system_prompt TEXT,

    -- Performance Tracking
    usage_count INTEGER DEFAULT 0,
    avg_confidence DECIMAL(3,2) DEFAULT 0,
    avg_user_rating DECIMAL(3,2) DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,

    -- Metadata
    created_by VARCHAR(255) NOT NULL,
    deprecated BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_prompt_templates_category ON prompt_templates(category);
CREATE INDEX idx_prompt_templates_deprecated ON prompt_templates(deprecated);

-- ============================================================================
-- USERS TABLE (for authentication)
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),

    -- Channels they manage
    managed_channels TEXT[] DEFAULT '{}',

    -- Subscription/Plan
    plan VARCHAR(50) DEFAULT 'free',
    api_calls_remaining INTEGER DEFAULT 100,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- SEED DEFAULT BENCHMARKS
-- ============================================================================

INSERT INTO benchmarks (metric, niche, channel_size_category, percentile_25, percentile_50, percentile_75, percentile_90) VALUES
-- CTR Benchmarks
('ctr', 'general', 'nano', 2.5, 4.0, 6.0, 8.5),
('ctr', 'general', 'micro', 3.0, 5.0, 7.5, 10.0),
('ctr', 'general', 'small', 3.5, 5.5, 8.0, 11.0),
('ctr', 'general', 'medium', 4.0, 6.0, 9.0, 12.0),
('ctr', 'general', 'large', 4.5, 7.0, 10.0, 13.5),
('ctr', 'general', 'mega', 5.0, 8.0, 11.0, 15.0),

-- Retention Benchmarks
('retention', 'general', 'nano', 30.0, 40.0, 50.0, 60.0),
('retention', 'general', 'micro', 35.0, 45.0, 55.0, 65.0),
('retention', 'general', 'small', 40.0, 50.0, 60.0, 70.0),
('retention', 'general', 'medium', 42.0, 52.0, 62.0, 72.0),
('retention', 'general', 'large', 45.0, 55.0, 65.0, 75.0),
('retention', 'general', 'mega', 48.0, 58.0, 68.0, 78.0),

-- Engagement Benchmarks
('engagement', 'general', 'nano', 2.0, 3.5, 5.5, 8.0),
('engagement', 'general', 'micro', 2.5, 4.0, 6.0, 9.0),
('engagement', 'general', 'small', 3.0, 4.5, 6.5, 9.5),
('engagement', 'general', 'medium', 3.2, 5.0, 7.0, 10.0),
('engagement', 'general', 'large', 3.5, 5.5, 7.5, 10.5),
('engagement', 'general', 'mega', 4.0, 6.0, 8.0, 11.0)
ON CONFLICT (metric, niche, channel_size_category) DO NOTHING;
