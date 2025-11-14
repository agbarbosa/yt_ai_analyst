import axios from 'axios';
import { extractChannelIdentifier, formatDuration } from '../utils/youtubeHelper.js';

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

class YouTubeService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Get channel ID from username or custom URL
   * @param {string} identifier - Channel username or custom name
   * @returns {Promise<string>} - Channel ID
   */
  async getChannelIdFromIdentifier(identifier) {
    try {
      // Try search endpoint to find channel
      const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
        params: {
          part: 'snippet',
          q: identifier,
          type: 'channel',
          maxResults: 1,
          key: this.apiKey
        }
      });

      if (response.data.items && response.data.items.length > 0) {
        return response.data.items[0].snippet.channelId;
      }

      throw new Error('Channel not found');
    } catch (error) {
      throw new Error(`Failed to find channel: ${error.message}`);
    }
  }

  /**
   * Get channel information
   * @param {string} channelId - YouTube channel ID
   * @returns {Promise<Object>} - Channel information
   */
  async getChannelInfo(channelId) {
    try {
      const response = await axios.get(`${YOUTUBE_API_BASE_URL}/channels`, {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: channelId,
          key: this.apiKey
        }
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('Channel not found');
      }

      return response.data.items[0];
    } catch (error) {
      throw new Error(`Failed to fetch channel info: ${error.message}`);
    }
  }

  /**
   * Get all videos from a channel
   * @param {string} channelUrl - YouTube channel URL
   * @param {number} maxResults - Maximum number of videos to fetch (default: 50)
   * @returns {Promise<Object>} - Channel and videos data
   */
  async getChannelVideos(channelUrl, maxResults = 50) {
    try {
      // Extract channel identifier from URL
      let identifier = extractChannelIdentifier(channelUrl);
      if (!identifier) {
        throw new Error('Invalid YouTube channel URL');
      }

      // Get channel ID (handles @username format)
      let channelId = identifier;
      if (!identifier.startsWith('UC')) {
        channelId = await this.getChannelIdFromIdentifier(identifier);
      }

      // Get channel information
      const channelInfo = await this.getChannelInfo(channelId);
      const uploadsPlaylistId = channelInfo.contentDetails.relatedPlaylists.uploads;

      // Fetch all videos from uploads playlist
      const videos = await this.getPlaylistVideos(uploadsPlaylistId, maxResults);

      // Get detailed video information including tags and statistics
      // YouTube API limits to 50 video IDs per request, so we need to batch
      const videoIds = videos.map(v => v.snippet.resourceId.videoId);
      const detailedVideos = await this.getVideoDetailsBatched(videoIds);

      // Format the response
      return {
        channel: {
          id: channelInfo.id,
          title: channelInfo.snippet.title,
          description: channelInfo.snippet.description,
          customUrl: channelInfo.snippet.customUrl,
          publishedAt: channelInfo.snippet.publishedAt,
          thumbnails: channelInfo.snippet.thumbnails,
          statistics: {
            viewCount: parseInt(channelInfo.statistics.viewCount),
            subscriberCount: parseInt(channelInfo.statistics.subscriberCount),
            videoCount: parseInt(channelInfo.statistics.videoCount)
          }
        },
        videos: detailedVideos.map(video => ({
          id: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          publishedAt: video.snippet.publishedAt,
          thumbnails: video.snippet.thumbnails,
          tags: video.snippet.tags || [],
          duration: formatDuration(video.contentDetails.duration),
          statistics: {
            viewCount: parseInt(video.statistics.viewCount || 0),
            likeCount: parseInt(video.statistics.likeCount || 0),
            commentCount: parseInt(video.statistics.commentCount || 0)
          },
          url: `https://www.youtube.com/watch?v=${video.id}`
        })),
        totalVideos: detailedVideos.length
      };
    } catch (error) {
      throw new Error(`Failed to fetch channel videos: ${error.message}`);
    }
  }

  /**
   * Get videos from a playlist
   * @param {string} playlistId - Playlist ID
   * @param {number} maxResults - Maximum number of videos
   * @returns {Promise<Array>} - Array of video items
   */
  async getPlaylistVideos(playlistId, maxResults) {
    const videos = [];
    let nextPageToken = null;

    try {
      do {
        const response = await axios.get(`${YOUTUBE_API_BASE_URL}/playlistItems`, {
          params: {
            part: 'snippet',
            playlistId: playlistId,
            maxResults: Math.min(50, maxResults - videos.length),
            pageToken: nextPageToken,
            key: this.apiKey
          }
        });

        videos.push(...response.data.items);
        nextPageToken = response.data.nextPageToken;
      } while (nextPageToken && videos.length < maxResults);

      return videos;
    } catch (error) {
      throw new Error(`Failed to fetch playlist videos: ${error.message}`);
    }
  }

  /**
   * Get detailed information for multiple videos (batched for large requests)
   * @param {Array<string>} videoIdsArray - Array of video IDs
   * @returns {Promise<Array>} - Array of detailed video information
   */
  async getVideoDetailsBatched(videoIdsArray) {
    try {
      const BATCH_SIZE = 50; // YouTube API limit
      const batches = [];

      // Split video IDs into chunks of 50
      for (let i = 0; i < videoIdsArray.length; i += BATCH_SIZE) {
        const chunk = videoIdsArray.slice(i, i + BATCH_SIZE);
        batches.push(chunk);
      }

      // Fetch details for each batch
      const allVideoDetails = [];
      for (const batch of batches) {
        const videoIds = batch.join(',');
        const details = await this.getVideoDetails(videoIds);
        allVideoDetails.push(...details);
      }

      return allVideoDetails;
    } catch (error) {
      throw new Error(`Failed to fetch batched video details: ${error.message}`);
    }
  }

  /**
   * Get detailed information for multiple videos
   * @param {string} videoIds - Comma-separated video IDs
   * @returns {Promise<Array>} - Array of detailed video information
   */
  async getVideoDetails(videoIds) {
    try {
      const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
        params: {
          part: 'snippet,contentDetails,statistics',
          id: videoIds,
          key: this.apiKey
        }
      });

      return response.data.items;
    } catch (error) {
      throw new Error(`Failed to fetch video details: ${error.message}`);
    }
  }
}

export default YouTubeService;
