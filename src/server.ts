/**
 * Express API Server
 * Main application entry point
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config';
import logger, { logAPICall } from './utils/logger';
import { youtubeAPI } from './services/youtube-api';
import { algorithmScorer } from './services/algorithm-scorer';
import { recommendationEngine } from './services/recommendation-engine';
import { db } from './database/postgres';

// Initialize Express app
const app: Express = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers - Configure CSP to allow inline scripts for the frontend
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"],  // Allow inline event handlers like onclick
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        styleSrcElem: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      },
    },
  })
);

// CORS
app.use(
  cors({
    origin: config.nodeEnv === 'production' ? config.apiBaseUrl : '*',
    credentials: true,
  })
);

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logAPICall(req.method, req.path, duration);
  });

  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// ============================================================================
// ROUTES
// ============================================================================

/**
 * Health check
 */
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const dbHealthy = await db.testConnection();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: dbHealthy ? 'connected' : 'disconnected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Service unhealthy',
    });
  }
});

/**
 * GET /api/channels/:channelId/analysis
 * Analyze a YouTube channel
 */
app.get('/api/channels/:channelId/analysis', async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;

    logger.info('Analyzing channel', { channelId });

    // Fetch channel data
    const channelData = await youtubeAPI.getChannelData(channelId);

    // Fetch recent videos
    const videoIds = await youtubeAPI.getChannelVideos(channelId, 20);
    const videosData = await youtubeAPI.getVideosDataBatch(videoIds);

    // Calculate algorithm score for channel
    const videos = videosData.map((v) => ({
      ...v,
      // Mock some required fields for scoring
      ctr: Math.random() * 10,
      avgPercentageViewed: 30 + Math.random() * 40,
      retentionAt15Seconds: 60 + Math.random() * 30,
      mainTrafficSource: 'browse' as const,
      trafficSources: youtubeAPI.getMockTrafficSources(),
      impressions: v.views! * (10 + Math.random() * 10),
      shares: Math.floor(v.views! * 0.01),
      subscribersGained: Math.floor(v.views! * 0.002),
      subscribersLost: Math.floor(v.views! * 0.0005),
      retentionAt25Percent: 40 + Math.random() * 30,
      retentionAt50Percent: 30 + Math.random() * 30,
      retentionAt75Percent: 20 + Math.random() * 25,
      retentionAt90Percent: 10 + Math.random() * 20,
      avgViewDuration: Math.floor(v.duration! * (0.3 + Math.random() * 0.3)),
      keywords: v.tags || [],
    })) as any[];

    const algorithmScore = algorithmScorer.calculateChannelScore(videos);

    res.json({
      channel: channelData,
      algorithmScore,
      recentVideos: videos.slice(0, 10),
      videoCount: videos.length,
    });
  } catch (error) {
    logger.error('Channel analysis failed', { error });
    res.status(500).json({
      error: 'Failed to analyze channel',
      message: (error as Error).message,
    });
  }
});

/**
 * GET /api/videos/:videoId/analysis
 * Analyze a specific video
 */
app.get('/api/videos/:videoId/analysis', async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;

    logger.info('Analyzing video', { videoId });

    // Fetch video data
    const videoData = await youtubeAPI.getVideoData(videoId);

    // Mock additional analytics data
    const video = {
      ...videoData,
      ctr: 3 + Math.random() * 7,
      avgPercentageViewed: 30 + Math.random() * 40,
      avgViewDuration: Math.floor(videoData.duration! * (0.3 + Math.random() * 0.3)),
      retentionAt15Seconds: 60 + Math.random() * 30,
      retentionAt25Percent: 50 + Math.random() * 25,
      retentionAt50Percent: 35 + Math.random() * 25,
      retentionAt75Percent: 25 + Math.random() * 20,
      retentionAt90Percent: 15 + Math.random() * 15,
      mainTrafficSource: 'browse' as const,
      trafficSources: youtubeAPI.getMockTrafficSources(),
      impressions: videoData.views! * (10 + Math.random() * 10),
      shares: Math.floor(videoData.views! * 0.01),
      subscribersGained: Math.floor(videoData.views! * 0.002),
      subscribersLost: Math.floor(videoData.views! * 0.0005),
      keywords: videoData.tags || [],
    } as any;

    // Calculate algorithm score
    const algorithmScore = algorithmScorer.calculateVideoScore(video);

    res.json({
      video,
      algorithmScore,
    });
  } catch (error) {
    logger.error('Video analysis failed', { error });
    res.status(500).json({
      error: 'Failed to analyze video',
      message: (error as Error).message,
    });
  }
});

/**
 * POST /api/videos/:videoId/recommendations
 * Generate recommendations for a video
 */
app.post('/api/videos/:videoId/recommendations', async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;

    logger.info('Generating video recommendations', { videoId });

    // Fetch video data
    const videoData = await youtubeAPI.getVideoData(videoId);

    // Mock analytics data
    const video = {
      ...videoData,
      ctr: 3 + Math.random() * 7,
      avgPercentageViewed: 30 + Math.random() * 40,
      avgViewDuration: Math.floor(videoData.duration! * (0.3 + Math.random() * 0.3)),
      retentionAt15Seconds: 60 + Math.random() * 30,
      retentionAt25Percent: 50 + Math.random() * 25,
      retentionAt50Percent: 35 + Math.random() * 25,
      retentionAt75Percent: 25 + Math.random() * 20,
      retentionAt90Percent: 15 + Math.random() * 15,
      mainTrafficSource: 'browse' as const,
      trafficSources: youtubeAPI.getMockTrafficSources(),
      impressions: videoData.views! * (10 + Math.random() * 10),
      shares: Math.floor(videoData.views! * 0.01),
      subscribersGained: Math.floor(videoData.views! * 0.002),
      subscribersLost: Math.floor(videoData.views! * 0.0005),
      keywords: videoData.tags || [],
    } as any;

    const algorithmScore = algorithmScorer.calculateVideoScore(video);
    const recommendations = await recommendationEngine.generateVideoRecommendations(
      video,
      algorithmScore
    );

    res.json({
      recommendations,
      totalCount: recommendations.length,
      quickWins: recommendations.filter(
        (r) => r.actionItems.some((a) => a.effort === 'low')
      ),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Recommendation generation failed', { error });
    res.status(500).json({
      error: 'Failed to generate recommendations',
      message: (error as Error).message,
    });
  }
});

/**
 * POST /api/videos/:videoId/optimize-title
 * Generate optimized title suggestions
 */
app.post('/api/videos/:videoId/optimize-title', async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;

    logger.info('Optimizing video title', { videoId });

    const videoData = await youtubeAPI.getVideoData(videoId);

    const video = {
      ...videoData,
      ctr: 3 + Math.random() * 7,
      mainTrafficSource: 'browse' as const,
      impressions: videoData.views! * (10 + Math.random() * 10),
      keywords: videoData.tags || [],
    } as any;

    const titles = await recommendationEngine.optimizeTitle(video);

    res.json({
      currentTitle: video.title,
      suggestedTitles: titles,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Title optimization failed', { error });
    res.status(500).json({
      error: 'Failed to optimize title',
      message: (error as Error).message,
    });
  }
});

/**
 * GET /api/channel/videos
 * Fetch channel data and videos by URL (for frontend)
 */
app.get('/api/channel/videos', async (req: Request, res: Response) => {
  try {
    const { url, maxResults = '50' } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "url" is required',
      });
    }

    logger.info('Fetching channel videos by URL', { url, maxResults });

    // Extract channel handle or ID from URL
    // Supports: https://www.youtube.com/@handle, https://www.youtube.com/channel/ID, @handle
    let channelIdentifier = url;

    const urlPatterns = [
      /youtube\.com\/@([^\/\?]+)/,  // @handle
      /youtube\.com\/channel\/([^\/\?]+)/,  // channel ID
      /youtube\.com\/c\/([^\/\?]+)/,  // custom URL
      /^@(.+)$/  // Just @handle
    ];

    for (const pattern of urlPatterns) {
      const match = url.match(pattern);
      if (match) {
        channelIdentifier = match[1];
        break;
      }
    }

    // Search for the channel
    const channelIds = await youtubeAPI.searchChannels(channelIdentifier, 1);

    if (channelIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found. Please check the URL and try again.',
      });
    }

    const channelId = channelIds[0];

    // Fetch channel data
    const channelData = await youtubeAPI.getChannelData(channelId);

    // Fetch videos
    const videoIds = await youtubeAPI.getChannelVideos(channelId, Number(maxResults));
    const videosData = await youtubeAPI.getVideosDataBatch(videoIds);

    // Format response for frontend
    return res.json({
      success: true,
      data: {
        channel: {
          id: channelData.id,
          title: channelData.title,
          customUrl: channelData.customUrl || `@${(channelData.title || '').replace(/\s+/g, '')}`,
          description: channelData.description,
          statistics: {
            viewCount: channelData.totalViews,
            subscriberCount: channelData.subscriberCount,
            videoCount: channelData.videoCount,
          },
        },
        totalVideos: videosData.length,
        videos: videosData.map(video => ({
          id: video.videoId,
          url: `https://www.youtube.com/watch?v=${video.videoId}`,
          title: video.title,
          description: video.description,
          publishedAt: video.publishedAt,
          thumbnailUrl: video.thumbnailUrl,
          statistics: {
            viewCount: video.views || 0,
            likeCount: video.likes || 0,
            commentCount: video.comments || 0,
          },
          tags: video.tags || [],
          duration: video.duration,
        })),
      },
    });
  } catch (error) {
    logger.error('Failed to fetch channel videos', { error });
    return res.status(500).json({
      success: false,
      message: (error as Error).message || 'Failed to fetch channel data',
    });
  }
});

/**
 * GET /api/search/channels
 * Search for channels
 */
app.get('/api/search/channels', async (req: Request, res: Response) => {
  try {
    const { q, maxResults = 10 } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        error: 'Query parameter "q" is required',
      });
    }

    logger.info('Searching for channels', { query: q });

    const channelIds = await youtubeAPI.searchChannels(q, Number(maxResults));
    const channels = await Promise.all(
      channelIds.map((id) => youtubeAPI.getChannelData(id))
    );

    return res.json({
      query: q,
      results: channels,
      count: channels.length,
    });
  } catch (error) {
    logger.error('Channel search failed', { error });
    return res.status(500).json({
      error: 'Failed to search channels',
      message: (error as Error).message,
    });
  }
});

/**
 * Helper function to extract channel identifier from URL
 */
function extractChannelIdentifier(url: string): string | null {
  try {
    // Handle different URL formats
    // Format 1: youtube.com/channel/UCxxxxx
    if (url.includes('/channel/')) {
      const match = url.match(/\/channel\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    }

    // Format 2: youtube.com/@username
    if (url.includes('/@')) {
      const match = url.match(/\/@([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    }

    // Format 3: youtube.com/c/customname or youtube.com/user/username
    if (url.includes('/c/') || url.includes('/user/')) {
      const match = url.match(/\/(c|user)\/([a-zA-Z0-9_-]+)/);
      return match ? match[2] : null;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Helper function to resolve channel ID from identifier (handle @username format)
 */
async function resolveChannelId(identifier: string): Promise<string> {
  // If it's already a channel ID (starts with UC), return it
  if (identifier.startsWith('UC')) {
    return identifier;
  }

  // Otherwise, search for the channel by name/handle
  const channelIds = await youtubeAPI.searchChannels(identifier, 1);
  if (channelIds.length === 0) {
    throw new Error(`Channel not found: ${identifier}`);
  }

  return channelIds[0];
}

/**
 * GET /api/channel/videos
 * Fetch all videos from a YouTube channel by URL
 */
app.get('/api/channel/videos', async (req: Request, res: Response) => {
  try {
    const { url, maxResults = 50 } = req.query;

    // Validate required parameters
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'Missing required parameter',
        message: 'Please provide a YouTube channel URL in the "url" query parameter',
      });
    }

    // Validate maxResults
    const maxResultsNum = parseInt(String(maxResults));
    if (isNaN(maxResultsNum) || maxResultsNum < 1 || maxResultsNum > 500) {
      return res.status(400).json({
        error: 'Invalid parameter',
        message: 'maxResults must be a number between 1 and 500',
      });
    }

    logger.info('Fetching channel videos', { url, maxResults: maxResultsNum });

    // Extract channel identifier from URL
    const identifier = extractChannelIdentifier(url);
    if (!identifier) {
      return res.status(400).json({
        error: 'Invalid YouTube channel URL',
        message: 'Could not extract channel identifier from the provided URL',
      });
    }

    // Resolve to channel ID
    const channelId = await resolveChannelId(identifier);

    // Fetch channel data
    const channelData = await youtubeAPI.getChannelData(channelId);

    // Fetch video IDs
    const videoIds = await youtubeAPI.getChannelVideos(channelId, maxResultsNum);

    // Fetch detailed video data in batches
    const videosData = await youtubeAPI.getVideosDataBatch(videoIds);

    return res.json({
      channel: channelData,
      videos: videosData,
      totalVideos: videosData.length,
      requestedMaxResults: maxResultsNum,
    });
  } catch (error) {
    logger.error('Failed to fetch channel videos', { error, url: req.query.url });
    return res.status(500).json({
      error: 'Failed to fetch channel videos',
      message: (error as Error).message,
    });
  }
});

/**
 * GET /api/channel/info
 * Fetch basic information about a YouTube channel by URL
 */
app.get('/api/channel/info', async (req: Request, res: Response) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'Missing required parameter',
        message: 'Please provide a YouTube channel URL in the "url" query parameter',
      });
    }

    logger.info('Fetching channel info', { url });

    // Extract channel identifier from URL
    const identifier = extractChannelIdentifier(url);
    if (!identifier) {
      return res.status(400).json({
        error: 'Invalid YouTube channel URL',
        message: 'Could not extract channel identifier from the provided URL',
      });
    }

    // Resolve to channel ID
    const channelId = await resolveChannelId(identifier);

    // Fetch channel data
    const channelData = await youtubeAPI.getChannelData(channelId);

    return res.json({
      channel: channelData,
    });
  } catch (error) {
    logger.error('Failed to fetch channel info', { error, url: req.query.url });
    return res.status(500).json({
      error: 'Failed to fetch channel info',
      message: (error as Error).message,
    });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', { error: err, path: req.path });

  res.status(500).json({
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong',
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
  try {
    // Test database connection
    const dbHealthy = await db.testConnection();
    if (!dbHealthy) {
      throw new Error('Database connection failed');
    }

    // Start listening
    app.listen(config.port, () => {
      logger.info(`Server started`, {
        port: config.port,
        env: config.nodeEnv,
        url: `http://localhost:${config.port}`,
      });

      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║       🎬 YouTube AI Analyst - Algorithm 2025 Edition      ║
║                                                            ║
║   Server running on: http://localhost:${config.port}            ║
║   Environment: ${config.nodeEnv.padEnd(10)}                            ║
║   API Docs: http://localhost:${config.port}/api               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

export default app;
