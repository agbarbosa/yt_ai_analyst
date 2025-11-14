import express from 'express';
import YouTubeService from '../services/youtubeService.js';

const router = express.Router();

/**
 * GET /api/channel/videos
 * Fetch all videos from a YouTube channel
 *
 * Query parameters:
 * - url: YouTube channel URL (required)
 * - maxResults: Maximum number of videos to fetch (optional, default: 50, max: 500)
 */
router.get('/videos', async (req, res) => {
  try {
    const { url, maxResults = 50 } = req.query;

    // Validate required parameters
    if (!url) {
      return res.status(400).json({
        error: 'Missing required parameter',
        message: 'Please provide a YouTube channel URL in the "url" query parameter'
      });
    }

    // Validate API key
    if (!process.env.YOUTUBE_API_KEY) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'YouTube API key is not configured'
      });
    }

    // Validate maxResults
    const maxResultsNum = parseInt(maxResults);
    if (isNaN(maxResultsNum) || maxResultsNum < 1 || maxResultsNum > 500) {
      return res.status(400).json({
        error: 'Invalid parameter',
        message: 'maxResults must be a number between 1 and 500'
      });
    }

    // Initialize YouTube service
    const youtubeService = new YouTubeService(process.env.YOUTUBE_API_KEY);

    // Fetch channel videos
    const data = await youtubeService.getChannelVideos(url, maxResultsNum);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch channel videos',
      message: error.message
    });
  }
});

/**
 * GET /api/channel/info
 * Fetch basic information about a YouTube channel
 *
 * Query parameters:
 * - url: YouTube channel URL (required)
 */
router.get('/info', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        error: 'Missing required parameter',
        message: 'Please provide a YouTube channel URL in the "url" query parameter'
      });
    }

    if (!process.env.YOUTUBE_API_KEY) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'YouTube API key is not configured'
      });
    }

    const youtubeService = new YouTubeService(process.env.YOUTUBE_API_KEY);

    // Get just the channel info without videos
    const data = await youtubeService.getChannelVideos(url, 1);

    res.json({
      success: true,
      data: {
        channel: data.channel
      }
    });
  } catch (error) {
    console.error('Error fetching channel info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch channel info',
      message: error.message
    });
  }
});

export default router;
