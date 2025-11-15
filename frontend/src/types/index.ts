export interface Thumbnail {
  url: string;
  width?: number;
  height?: number;
}

export interface Thumbnails {
  default?: Thumbnail;
  medium?: Thumbnail;
  high?: Thumbnail;
  standard?: Thumbnail;
  maxres?: Thumbnail;
  [key: string]: Thumbnail | undefined;
}

export interface VideoStatistics {
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

export interface ChannelStatistics {
  viewCount: number;
  subscriberCount: number;
  videoCount: number;
}

export interface VideoDetails {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnails: Thumbnails;
  url: string;
  duration: string;
  tags: string[];
  statistics: VideoStatistics;
}

export interface ChannelDetails {
  id: string;
  title: string;
  description: string;
  customUrl?: string;
  thumbnails: Thumbnails;
  statistics: ChannelStatistics;
}

export interface ChannelAnalysisData {
  channel: ChannelDetails;
  videos: VideoDetails[];
  totalVideos: number;
}

// Legacy types for backward compatibility
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  tags?: string[];
  category?: string;
}

export interface Channel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  publishedAt: string;
  customUrl?: string;
}

export interface VideoAnalytics {
  videoId: string;
  viewsOverTime: TimeSeriesData[];
  engagementRate: number;
  averageViewDuration: number;
  clickThroughRate: number;
  impressions: number;
  retentionData: RetentionData[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface RetentionData {
  timeSeconds: number;
  percentage: number;
}

export interface ChannelAnalytics {
  channelId: string;
  subscribersOverTime: TimeSeriesData[];
  viewsOverTime: TimeSeriesData[];
  topVideos: Video[];
  engagementMetrics: {
    averageLikes: number;
    averageComments: number;
    averageViews: number;
  };
}

export interface Recommendation {
  id: string;
  type: 'content' | 'timing' | 'seo' | 'engagement';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
  actionItems?: string[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export type TimeRange = '24h' | '7d' | '30d' | '90d' | '1y';
export type VideoCategory = typeof import('../config/constants').VIDEO_CATEGORIES[number];
