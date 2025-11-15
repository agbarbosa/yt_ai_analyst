import { apiRequest } from '../utils/axios';
import { API_ENDPOINTS } from '../config/constants';
import type { Recommendation, ApiResponse } from '../types';

export const recommendationService = {
  /**
   * Get recommendations for a video
   */
  async getVideoRecommendations(videoId: string): Promise<ApiResponse<Recommendation[]>> {
    return apiRequest<Recommendation[]>({
      method: 'GET',
      url: `${API_ENDPOINTS.RECOMMENDATIONS}/video/${videoId}`,
    });
  },

  /**
   * Get recommendations for a channel
   */
  async getChannelRecommendations(channelId: string): Promise<ApiResponse<Recommendation[]>> {
    return apiRequest<Recommendation[]>({
      method: 'GET',
      url: `${API_ENDPOINTS.RECOMMENDATIONS}/channel/${channelId}`,
    });
  },

  /**
   * Get general recommendations
   */
  async getGeneralRecommendations(): Promise<ApiResponse<Recommendation[]>> {
    return apiRequest<Recommendation[]>({
      method: 'GET',
      url: API_ENDPOINTS.RECOMMENDATIONS,
    });
  },
};
