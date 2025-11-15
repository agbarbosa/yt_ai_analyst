import { apiRequest } from '../utils/axios';
import { API_ENDPOINTS } from '../config/constants';
import type { Video, VideoAnalytics, ApiResponse } from '../types';

export const videoService = {
  /**
   * Get video details by ID
   */
  async getVideoById(videoId: string): Promise<ApiResponse<Video>> {
    return apiRequest<Video>({
      method: 'GET',
      url: `${API_ENDPOINTS.VIDEO}/${videoId}`,
    });
  },

  /**
   * Analyze a video by URL or ID
   */
  async analyzeVideo(videoUrl: string): Promise<ApiResponse<Video>> {
    return apiRequest<Video>({
      method: 'POST',
      url: `${API_ENDPOINTS.VIDEO}/analyze`,
      data: { url: videoUrl },
    });
  },

  /**
   * Get video analytics
   */
  async getVideoAnalytics(
    videoId: string,
    timeRange: string = '30d'
  ): Promise<ApiResponse<VideoAnalytics>> {
    return apiRequest<VideoAnalytics>({
      method: 'GET',
      url: `${API_ENDPOINTS.ANALYTICS}/video/${videoId}`,
      params: { timeRange },
    });
  },

  /**
   * Search videos
   */
  async searchVideos(query: string, filters?: {
    category?: string;
    sortBy?: string;
    limit?: number;
  }): Promise<ApiResponse<Video[]>> {
    return apiRequest<Video[]>({
      method: 'GET',
      url: `${API_ENDPOINTS.VIDEO}/search`,
      params: { q: query, ...filters },
    });
  },
};
