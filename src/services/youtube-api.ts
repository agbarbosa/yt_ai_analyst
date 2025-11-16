/**
 * YouTube API Service
 * Handles all interactions with YouTube Data API v3 and Analytics API
 */

import { google, youtube_v3 } from 'googleapis';
import { config } from '../config';
import logger, { logYouTubeAPI } from '../utils/logger';
import { Channel, Video, TrafficSourceBreakdown } from '../types/models';

export class YouTubeAPIService {
  private youtube: youtube_v3.Youtube;
  private static instance: YouTubeAPIService;

  private constructor() {
    this.youtube = google.youtube({
      version: 'v3',
      auth: config.youtube.apiKey,
    });
    logger.info('YouTube API service initialized');
  }

  public static getInstance(): YouTubeAPIService {
    if (!YouTubeAPIService.instance) {
      YouTubeAPIService.instance = new YouTubeAPIService();
    }
    return YouTubeAPIService.instance;
  }

  /**
   * Fetch channel details and statistics
   * Supports both channel IDs and handles (e.g., @LinusTechTips)
   */
  public async getChannelData(channelIdentifier: string): Promise<Partial<Channel>> {
    try {
      // Determine if input is a handle or channel ID
      const isHandle = channelIdentifier.startsWith('@');

      // Build request parameters based on identifier type
      const requestParams: any = {
        part: ['snippet', 'statistics', 'contentDetails'],
      };

      if (isHandle) {
        // Remove @ symbol for the API call
        requestParams.forHandle = channelIdentifier.substring(1);
        logger.info('Fetching channel by handle', { handle: channelIdentifier });
      } else {
        requestParams.id = [channelIdentifier];
        logger.info('Fetching channel by ID', { channelId: channelIdentifier });
      }

      const response = await this.youtube.channels.list(requestParams);

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error(`Channel not found: ${channelIdentifier}`);
      }

      const channel = response.data.items[0];
      const snippet = channel.snippet;
      const statistics = channel.statistics;
      const actualChannelId = channel.id || channelIdentifier;

      logYouTubeAPI('getChannelData', channelIdentifier, true);

      return {
        channelId: actualChannelId,
        title: snippet?.title || '',
        description: snippet?.description || '',
        customUrl: snippet?.customUrl || '',
        thumbnails: snippet?.thumbnails as any, // YouTube API thumbnails object
        subscriberCount: parseInt(statistics?.subscriberCount || '0'),
        totalViews: parseInt(statistics?.viewCount || '0'),
        videoCount: parseInt(statistics?.videoCount || '0'),
        analyzedAt: new Date(),
        lastUpdated: new Date(),
      };
    } catch (error) {
      logYouTubeAPI('getChannelData', channelIdentifier, false);
      logger.error('Failed to fetch channel data', { channelIdentifier, error });
      throw error;
    }
  }

  /**
   * Fetch all videos from a channel
   * Supports both channel IDs and handles (e.g., @LinusTechTips)
   */
  public async getChannelVideos(
    channelIdentifier: string,
    maxResults: number = 50
  ): Promise<string[]> {
    try {
      // Determine if input is a handle or channel ID
      const isHandle = channelIdentifier.startsWith('@');

      // Build request parameters based on identifier type
      const requestParams: any = {
        part: ['contentDetails'],
      };

      if (isHandle) {
        requestParams.forHandle = channelIdentifier.substring(1);
      } else {
        requestParams.id = [channelIdentifier];
      }

      // Get uploads playlist ID
      const channelResponse = await this.youtube.channels.list(requestParams);

      if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
        throw new Error(`Channel not found: ${channelIdentifier}`);
      }

      const uploadsPlaylistId =
        channelResponse.data.items[0].contentDetails?.relatedPlaylists?.uploads;

      if (!uploadsPlaylistId) {
        throw new Error(`No uploads playlist found for channel: ${channelIdentifier}`);
      }

      // Fetch videos from uploads playlist
      const videoIds: string[] = [];
      let pageToken: string | undefined;

      do {
        const playlistResponse = await this.youtube.playlistItems.list({
          part: ['contentDetails'],
          playlistId: uploadsPlaylistId,
          maxResults: Math.min(maxResults - videoIds.length, 50),
          pageToken,
        });

        if (playlistResponse.data.items) {
          playlistResponse.data.items.forEach((item) => {
            const videoId = item.contentDetails?.videoId;
            if (videoId) {
              videoIds.push(videoId);
            }
          });
        }

        pageToken = playlistResponse.data.nextPageToken || undefined;
      } while (pageToken && videoIds.length < maxResults);

      logYouTubeAPI('getChannelVideos', channelIdentifier, true);
      logger.info('Fetched channel videos', { channelIdentifier, count: videoIds.length });

      return videoIds;
    } catch (error) {
      logYouTubeAPI('getChannelVideos', channelIdentifier, false);
      logger.error('Failed to fetch channel videos', { channelIdentifier, error });
      throw error;
    }
  }

  /**
   * Fetch video details and statistics
   */
  public async getVideoData(videoId: string): Promise<Partial<Video>> {
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: [videoId],
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error(`Video not found: ${videoId}`);
      }

      const video = response.data.items[0];
      const snippet = video.snippet;
      const statistics = video.statistics;
      const contentDetails = video.contentDetails;

      // Parse duration (ISO 8601 format)
      const duration = this.parseDuration(contentDetails?.duration || '');

      // Determine if it's a Short (< 60 seconds)
      const isShort = duration < 60;

      logYouTubeAPI('getVideoData', videoId, true);

      return {
        videoId,
        channelId: snippet?.channelId || '',
        title: snippet?.title || '',
        description: snippet?.description || '',
        publishedAt: new Date(snippet?.publishedAt || Date.now()),
        duration,
        isShort,
        thumbnailUrl: snippet?.thumbnails?.maxres?.url || snippet?.thumbnails?.high?.url || '',
        thumbnails: snippet?.thumbnails as any, // YouTube API thumbnails object
        views: parseInt(statistics?.viewCount || '0'),
        likes: parseInt(statistics?.likeCount || '0'),
        comments: parseInt(statistics?.commentCount || '0'),
        tags: snippet?.tags || [],
        category: snippet?.categoryId || '',
        analyzedAt: new Date(),
        lastUpdated: new Date(),
      };
    } catch (error) {
      logYouTubeAPI('getVideoData', videoId, false);
      logger.error('Failed to fetch video data', { videoId, error });
      throw error;
    }
  }

  /**
   * Fetch multiple videos in batch
   */
  public async getVideosDataBatch(videoIds: string[]): Promise<Partial<Video>[]> {
    const results: Partial<Video>[] = [];
    const batchSize = 50; // YouTube API limit

    try {
      logger.info('Starting batch video fetch', {
        totalVideos: videoIds.length,
        batches: Math.ceil(videoIds.length / batchSize)
      });

      for (let i = 0; i < videoIds.length; i += batchSize) {
        const batch = videoIds.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;

        logger.info('Fetching video batch', {
          batchNumber,
          batchSize: batch.length,
          progress: `${i + batch.length}/${videoIds.length}`
        });

        const response = await this.youtube.videos.list({
          part: ['snippet', 'statistics', 'contentDetails'],
          id: batch,
        });

        if (response.data.items) {
          for (const video of response.data.items) {
            const snippet = video.snippet;
            const statistics = video.statistics;
            const contentDetails = video.contentDetails;
            const duration = this.parseDuration(contentDetails?.duration || '');

            results.push({
              videoId: video.id || '',
              channelId: snippet?.channelId || '',
              title: snippet?.title || '',
              description: snippet?.description || '',
              publishedAt: new Date(snippet?.publishedAt || Date.now()),
              duration,
              isShort: duration < 60,
              thumbnailUrl: snippet?.thumbnails?.maxres?.url || snippet?.thumbnails?.high?.url || '',
              thumbnails: snippet?.thumbnails as any, // YouTube API thumbnails object
              views: parseInt(statistics?.viewCount || '0'),
              likes: parseInt(statistics?.likeCount || '0'),
              comments: parseInt(statistics?.commentCount || '0'),
              tags: snippet?.tags || [],
              category: snippet?.categoryId || '',
              analyzedAt: new Date(),
              lastUpdated: new Date(),
            });
          }
        }

        // Rate limiting delay
        if (i + batchSize < videoIds.length) {
          logger.info('Applying rate limit delay before next batch', { delayMs: 100 });
          await this.delay(100);
        }
      }

      logYouTubeAPI('getVideosDataBatch', `${videoIds.length} videos`, true);
      logger.info('Batch video fetch completed', {
        requested: videoIds.length,
        fetched: results.length
      });

      return results;
    } catch (error) {
      logYouTubeAPI('getVideosDataBatch', `${videoIds.length} videos`, false);
      logger.error('Failed to fetch videos batch', { error });
      throw error;
    }
  }

  /**
   * Search for channels by keyword
   */
  public async searchChannels(query: string, maxResults: number = 10): Promise<string[]> {
    try {
      const response = await this.youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['channel'],
        maxResults,
      });

      const channelIds: string[] = [];

      if (response.data.items) {
        response.data.items.forEach((item) => {
          const channelId = item.snippet?.channelId;
          if (channelId) {
            channelIds.push(channelId);
          }
        });
      }

      logYouTubeAPI('searchChannels', query, true);
      logger.info('Searched for channels', { query, count: channelIds.length });

      return channelIds;
    } catch (error) {
      logYouTubeAPI('searchChannels', query, false);
      logger.error('Failed to search channels', { query, error });
      throw error;
    }
  }

  /**
   * Parse ISO 8601 duration to seconds
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Delay helper for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Calculate basic CTR estimate (requires Analytics API for accurate data)
   */
  public estimateCTR(views: number, impressions: number): number {
    if (impressions === 0) return 0;
    return (views / impressions) * 100;
  }

  /**
   * Classify traffic source based on available data
   */
  public classifyTrafficSource(views: number, subscribers: number): 'search' | 'browse' | 'shorts' | 'external' {
    // This is a simplified classification
    // In production, use YouTube Analytics API for accurate data
    const subToViewRatio = subscribers > 0 ? views / subscribers : 0;

    if (subToViewRatio > 2) {
      return 'search'; // High view-to-sub ratio suggests search traffic
    } else if (subToViewRatio > 0.5) {
      return 'browse'; // Medium ratio suggests browse features
    } else {
      return 'browse'; // Low ratio suggests subscriber base
    }
  }

  /**
   * Get mock traffic source breakdown
   * TODO: Replace with YouTube Analytics API integration
   */
  public getMockTrafficSources(): TrafficSourceBreakdown {
    return {
      search: 25,
      browse: 45,
      shorts: 10,
      external: 15,
      playlist: 3,
      other: 2,
    };
  }
}

export const youtubeAPI = YouTubeAPIService.getInstance();
export default youtubeAPI;
