/**
 * YouTube AI Analyst - Data Models
 *
 * Core TypeScript interfaces and types for the application
 * Based on YouTube Algorithm 2025 criteria
 */

// ============================================================================
// CHANNEL MODELS
// ============================================================================

export interface Channel {
  id: string;
  channelId: string; // YouTube channel ID
  title: string;
  description?: string;
  customUrl?: string;

  // Statistics
  subscriberCount: number;
  totalViews: number;
  videoCount: number;

  // Performance Metrics (90-day averages)
  avgCTR: number; // Percentage
  avgWatchTime: number; // Seconds
  avgRetentionRate: number; // Percentage
  avgEngagementRate: number; // Percentage

  // Content Analysis
  primaryTopics: string[];
  secondaryTopics: string[];
  uploadFrequency: UploadFrequency;
  avgVideoLength: number; // Seconds
  shortsPercentage: number; // Percentage of content that is Shorts

  // Audience Data
  targetAudience?: string;
  primaryDemographic?: Demographic;
  mainTrafficSources: TrafficSourceBreakdown;

  // Timestamps
  createdAt: Date;
  analyzedAt: Date;
  lastUpdated: Date;
}

export type UploadFrequency =
  | 'multiple_per_day'
  | 'daily'
  | 'multiple_per_week'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'irregular';

export interface Demographic {
  ageRange: string; // e.g., "18-24", "25-34"
  gender: 'male' | 'female' | 'mixed';
  topCountries: string[]; // ISO country codes
}

export interface TrafficSourceBreakdown {
  search: number; // Percentage
  browse: number; // Percentage (home, recommended)
  shorts: number; // Percentage
  external: number; // Percentage
  playlist: number; // Percentage
  other: number; // Percentage
}

// ============================================================================
// VIDEO MODELS
// ============================================================================

export interface Video {
  id: string;
  videoId: string; // YouTube video ID
  channelId: string;

  // Basic Info
  title: string;
  description: string;
  publishedAt: Date;
  duration: number; // Seconds
  isShort: boolean;

  // Thumbnail
  thumbnailUrl: string;
  thumbnailQuality?: 'low' | 'medium' | 'high' | 'custom';

  // Performance Metrics
  views: number;
  impressions: number;
  ctr: number; // Click-through rate percentage
  avgViewDuration: number; // Seconds
  avgPercentageViewed: number; // Percentage

  // Engagement
  likes: number;
  dislikes?: number; // May not be available
  comments: number;
  shares: number;
  subscribersGained: number;
  subscribersLost: number;

  // Retention Data
  retentionAt15Seconds: number; // Percentage - CRITICAL METRIC
  retentionAt25Percent: number;
  retentionAt50Percent: number;
  retentionAt75Percent: number;
  retentionAt90Percent: number;
  retentionCurve?: RetentionPoint[]; // Detailed retention graph

  // Traffic Sources
  trafficSources: TrafficSourceBreakdown;
  mainTrafficSource: 'search' | 'browse' | 'shorts' | 'external';

  // SEO
  tags: string[];
  keywords: string[];
  category: string;

  // Algorithm Scoring
  algorithmScore?: AlgorithmScore;

  // Survey Data (if available)
  satisfactionScore?: number; // 0-100
  negativeSignalRate?: number; // Percentage of "Not Interested" clicks

  // Timestamps
  createdAt: Date;
  analyzedAt: Date;
  lastUpdated: Date;
}

export interface RetentionPoint {
  timestamp: number; // Seconds into video
  percentage: number; // Percentage of viewers remaining
}

// ============================================================================
// ALGORITHM SCORE MODELS
// ============================================================================

export interface AlgorithmScore {
  overall: number; // 0-100 total score
  breakdown: {
    ctrScore: number; // 0-25 points
    watchTimeScore: number; // 0-35 points
    engagementScore: number; // 0-25 points
    satisfactionScore: number; // 0-15 points
  };
  strengths: string[]; // What's working well
  weaknesses: string[]; // What needs improvement
  opportunities: string[]; // Potential improvements
  grade: ScoreGrade;
}

export type ScoreGrade = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';

// Score interpretation:
// 90-100: A+ (Excellent, viral potential)
// 80-89: A (Very good, strong algorithm performance)
// 70-79: B+ (Good, above average)
// 60-69: B (Average, room for improvement)
// 50-59: C+ (Below average, needs optimization)
// 40-49: C (Poor, significant issues)
// 30-39: D (Very poor, major problems)
// 0-29: F (Critical issues, needs immediate attention)

// ============================================================================
// RECOMMENDATION MODELS
// ============================================================================

export interface Recommendation {
  id: string;
  targetId: string; // channelId or videoId
  targetType: 'channel' | 'video';
  category: RecommendationCategory;
  priority: RecommendationPriority;

  // Content
  title: string;
  description: string;
  actionItems: ActionItem[];
  expectedImpact: ImpactEstimate;

  // AI Generation Info
  generatedBy: AIModel;
  reasoning: string; // Why this recommendation was made
  prompt: string; // The prompt used to generate this (for debugging/improvement)
  confidence: number; // 0-1, how confident the AI is

  // Implementation Tracking
  status: RecommendationStatus;
  implementedAt?: Date;
  implementationNotes?: string;
  actualImpact?: ActualImpact;

  // User Feedback
  userRating?: number; // 1-5 stars
  userFeedback?: string;
  helpful?: boolean;

  // Timestamps
  createdAt: Date;
  expiresAt?: Date; // Some recommendations may become outdated
}

export type RecommendationCategory =
  | 'title_optimization'
  | 'thumbnail_improvement'
  | 'content_structure'
  | 'engagement_tactics'
  | 'seo_keywords'
  | 'upload_schedule'
  | 'shorts_strategy'
  | 'audience_targeting'
  | 'retention_improvement'
  | 'cta_optimization'
  | 'topic_selection'
  | 'collaboration'
  | 'playlist_strategy'
  | 'end_screen_optimization';

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

export type RecommendationStatus =
  | 'pending'
  | 'in_progress'
  | 'implemented'
  | 'dismissed'
  | 'expired';

export type AIModel = 'claude-sonnet-4.5' | 'claude-opus-4' | 'gpt-4' | 'gemini-pro';

export interface ActionItem {
  action: string; // What to do
  details: string; // How to do it
  effort: EffortLevel;
  timeline: string; // e.g., "5 minutes", "1 hour", "1 week"
  order: number; // Step order
}

export type EffortLevel = 'low' | 'medium' | 'high';

export interface ImpactEstimate {
  metric: string; // e.g., "CTR", "Retention Rate", "Engagement Rate"
  currentValue: number;
  projectedValue: number;
  improvement: number; // Percentage improvement
  confidence: number; // 0-1
  timeframe: string; // e.g., "1-2 weeks", "1 month"
}

export interface ActualImpact {
  metric: string;
  beforeValue: number;
  afterValue: number;
  actualImprovement: number; // Percentage
  measuredAt: Date;
  accuracyVsPrediction: number; // How close the estimate was
}

// ============================================================================
// PERFORMANCE GAP MODELS
// ============================================================================

export interface PerformanceGap {
  category: RecommendationCategory;
  metric: string;
  currentValue: number;
  benchmarkValue: number;
  gap: number; // Percentage difference
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

// ============================================================================
// ANALYTICS & TRENDS
// ============================================================================

export interface TrendData {
  metric: string;
  timeRange: TimeRange;
  dataPoints: DataPoint[];
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  percentageChange: number;
  insights: string[];
}

export interface DataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

export type TimeRange =
  | 'last_7_days'
  | 'last_30_days'
  | 'last_90_days'
  | 'last_6_months'
  | 'last_year'
  | 'all_time';

// ============================================================================
// BENCHMARK DATA
// ============================================================================

export interface Benchmark {
  metric: string;
  niche: string;
  channelSizeCategory: ChannelSizeCategory;
  percentile25: number; // Bottom 25%
  percentile50: number; // Median
  percentile75: number; // Top 25%
  percentile90: number; // Top 10%
  lastUpdated: Date;
}

export type ChannelSizeCategory =
  | 'nano' // <1k subs
  | 'micro' // 1k-10k
  | 'small' // 10k-100k
  | 'medium' // 100k-1M
  | 'large' // 1M-10M
  | 'mega'; // 10M+

// ============================================================================
// AI PROMPT MODELS
// ============================================================================

export interface PromptTemplate {
  id: string;
  name: string;
  category: RecommendationCategory;
  version: string;
  template: string; // Template with {{variable}} placeholders
  variables: PromptVariable[];
  model: AIModel;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;

  // Performance tracking
  usageCount: number;
  avgConfidence: number;
  avgUserRating: number;
  successRate: number; // Percentage of recommendations marked as helpful

  // Metadata
  createdBy: string;
  createdAt: Date;
  lastUpdated: Date;
  deprecated?: boolean;
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'array' | 'object';
  required: boolean;
  description: string;
  example?: any;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface ChannelAnalysisRequest {
  channelId: string;
  forceRefresh?: boolean; // Force fetch new data from YouTube
  includeVideos?: boolean; // Include detailed video analysis
  timeRange?: TimeRange;
}

export interface ChannelAnalysisResponse {
  channel: Channel;
  algorithmScore: AlgorithmScore;
  performanceGaps: PerformanceGap[];
  topVideos: Video[]; // Top 5 performing
  bottomVideos: Video[]; // Bottom 5 performing
  trends: {
    ctr: TrendData;
    retention: TrendData;
    engagement: TrendData;
    subscriberGrowth: TrendData;
  };
  benchmarks: {
    ctr: Benchmark;
    retention: Benchmark;
    engagement: Benchmark;
  };
}

export interface VideoAnalysisRequest {
  videoId: string;
  forceRefresh?: boolean;
}

export interface VideoAnalysisResponse {
  video: Video;
  algorithmScore: AlgorithmScore;
  performanceGaps: PerformanceGap[];
  retentionCurve: RetentionPoint[];
  trafficSources: TrafficSourceBreakdown;
  competitorComparison?: CompetitorComparison;
}

export interface RecommendationRequest {
  targetId: string;
  targetType: 'channel' | 'video';
  includeCategories?: RecommendationCategory[];
  excludeCategories?: RecommendationCategory[];
  priorityLevel?: RecommendationPriority;
  limit?: number;
  includeQuickWins?: boolean; // Low effort, high impact only
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  quickWins: Recommendation[]; // Filtered low effort + high impact
  totalCount: number;
  generatedAt: Date;
}

export interface VideoOptimizationRequest {
  videoId: string;
  optimizationGoal: 'ctr' | 'retention' | 'engagement' | 'overall';
  includeCreative: boolean; // Generate titles, descriptions, etc.
}

export interface VideoOptimizationResponse {
  video: Video;
  recommendations: Recommendation[];
  suggestedTitles: TitleSuggestion[];
  suggestedThumbnails: ThumbnailSuggestion[];
  suggestedDescription: string;
  suggestedTags: string[];
  estimatedImprovement: ImpactEstimate;
}

export interface TitleSuggestion {
  title: string;
  reasoning: string;
  expectedCTRImprovement: number; // Percentage
  keywords: string[];
  length: number;
}

export interface ThumbnailSuggestion {
  description: string;
  elements: string[];
  colorScheme: string[];
  textOverlay?: string;
  designRationale: string;
}

export interface CompetitorComparison {
  similarVideos: Video[];
  avgCompetitorCTR: number;
  avgCompetitorRetention: number;
  avgCompetitorEngagement: number;
  competitiveAdvantages: string[];
  competitiveDisadvantages: string[];
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export type ErrorCode =
  | 'YOUTUBE_API_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_CHANNEL_ID'
  | 'INVALID_VIDEO_ID'
  | 'INSUFFICIENT_DATA'
  | 'AI_GENERATION_FAILED'
  | 'DATABASE_ERROR'
  | 'AUTHENTICATION_FAILED'
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND';

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface AppConfig {
  youtube: {
    apiKey: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  ai: {
    anthropic: {
      apiKey: string;
      model: string;
      defaultTemperature: number;
    };
    openai?: {
      apiKey: string;
      model: string;
      defaultTemperature: number;
    };
    google?: {
      apiKey: string;
      model: string;
    };
  };
  database: {
    postgres: {
      host: string;
      port: number;
      database: string;
      user: string;
      password: string;
    };
    mongodb: {
      uri: string;
      database: string;
    };
    redis: {
      host: string;
      port: number;
      password?: string;
    };
  };
  server: {
    port: number;
    corsOrigins: string[];
    rateLimits: {
      windowMs: number;
      max: number;
    };
  };
}
