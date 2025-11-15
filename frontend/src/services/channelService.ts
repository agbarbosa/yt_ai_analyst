import { apiRequest } from '../utils/axios';
import { API_ENDPOINTS } from '../config/constants';
import type { Channel, ChannelAnalytics, Video, ApiResponse } from '../types';

export const channelService = {
  /**
   * Get channel details by ID
   */
  async getChannelById(channelId: string): Promise<ApiResponse<Channel>> {
    return apiRequest<Channel>({
      method: 'GET',
      url: `${API_ENDPOINTS.CHANNEL}/${channelId}`,
    });
  },

  /**
   * Analyze a channel by URL or ID
   */
  async analyzeChannel(channelUrl: string): Promise<ApiResponse<Channel>> {
    return apiRequest<Channel>({
      method: 'POST',
      url: `${API_ENDPOINTS.CHANNEL}/analyze`,
      data: { url: channelUrl },
    });
  },

  /**
   * Get channel analytics
   */
  async getChannelAnalytics(
    channelId: string,
    timeRange: string = '30d'
  ): Promise<ApiResponse<ChannelAnalytics>> {
    return apiRequest<ChannelAnalytics>({
      method: 'GET',
      url: `${API_ENDPOINTS.ANALYTICS}/channel/${channelId}`,
      params: { timeRange },
    });
  },

  /**
   * Get channel videos
   */
  async getChannelVideos(
    channelId: string,
    options?: {
      sortBy?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<ApiResponse<Video[]>> {
    return apiRequest<Video[]>({
      method: 'GET',
      url: `${API_ENDPOINTS.CHANNEL}/${channelId}/videos`,
      params: options,
    });
  },
};
