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
import fs from 'fs';
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
// In Docker: public/ contains the built React app
// In local: public/ contains static assets
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
    logger.info('Fetching channel data from YouTube API', { channelId });
    const channelData = await youtubeAPI.getChannelData(channelId);
    logger.info('Channel data retrieved', {
      channelId,
      title: channelData.title,
      subscriberCount: channelData.subscriberCount
    });

    // Fetch recent videos
    logger.info('Fetching channel videos', { channelId, maxResults: 20 });
    const videoIds = await youtubeAPI.getChannelVideos(channelId, 20);
    logger.info('Video IDs retrieved', { channelId, videoCount: videoIds.length });

    const videosData = await youtubeAPI.getVideosDataBatch(videoIds);
    logger.info('Video details fetched', { channelId, videosCount: videosData.length });

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

    logger.info('Calculating algorithm score', { channelId, videoCount: videos.length });
    const algorithmScore = algorithmScorer.calculateChannelScore(videos);
    logger.info('Algorithm score calculated', {
      channelId,
      overallScore: algorithmScore.overall,
      grade: algorithmScore.grade
    });

    res.json({
      channel: channelData,
      algorithmScore,
      recentVideos: videos.slice(0, 10),
      videoCount: videos.length,
    });

    logger.info('Channel analysis completed successfully', { channelId });
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
 * POST /api/channels/:channelId/recommendations
 * Generate AI-powered recommendations for a channel
 */
app.post('/api/channels/:channelId/recommendations', async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;

    logger.info('Generating channel recommendations', { channelId });

    // Fetch channel data
    logger.info('Fetching channel data for recommendations', { channelId });
    const channelData = await youtubeAPI.getChannelData(channelId);
    logger.info('Channel data fetched', { channelId, title: channelData.title });

    // Fetch recent videos for analysis
    logger.info('Fetching recent videos for analysis', { channelId, maxResults: 20 });
    const videoIds = await youtubeAPI.getChannelVideos(channelId, 20);
    const videosData = await youtubeAPI.getVideosDataBatch(videoIds);
    logger.info('Videos data collected', { channelId, videoCount: videosData.length });

    // Enhance videos with mock analytics data
    const videos = videosData.map((v) => ({
      ...v,
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

    // Calculate algorithm score
    logger.info('Calculating algorithm score for recommendations', { channelId });
    const algorithmScore = algorithmScorer.calculateChannelScore(videos);
    logger.info('Algorithm score calculated', {
      channelId,
      score: algorithmScore.overall,
      grade: algorithmScore.grade
    });

    // Generate recommendations using AI
    logger.info('Generating AI recommendations', { channelId, videoCount: videos.length });
    const recommendations = await recommendationEngine.generateChannelRecommendations(
      channelData as any,
      videos
    );
    logger.info('AI recommendations generated', {
      channelId,
      recommendationCount: recommendations.length,
      criticalCount: recommendations.filter(r => r.priority === 'critical').length,
      highCount: recommendations.filter(r => r.priority === 'high').length
    });

    res.json({
      recommendations,
      algorithmScore,
      totalCount: recommendations.length,
      criticalCount: recommendations.filter(r => r.priority === 'critical').length,
      highCount: recommendations.filter(r => r.priority === 'high').length,
      generatedAt: new Date().toISOString(),
    });

    logger.info('Channel recommendations completed successfully', { channelId });
  } catch (error) {
    logger.error('Channel recommendation generation failed', { error });
    res.status(500).json({
      error: 'Failed to generate channel recommendations',
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
      logger.warn('Missing URL parameter in channel videos request');
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
      /youtube\.com\/@([^/?]+)/,  // @handle
      /youtube\.com\/channel\/([^/?]+)/,  // channel ID
      /youtube\.com\/c\/([^/?]+)/,  // custom URL
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
    logger.info('Searching for channel', { identifier: channelIdentifier });
    const channelIds = await youtubeAPI.searchChannels(channelIdentifier, 1);

    if (channelIds.length === 0) {
      logger.warn('Channel not found', { identifier: channelIdentifier, url });
      return res.status(404).json({
        success: false,
        message: 'Channel not found. Please check the URL and try again.',
      });
    }

    const channelId = channelIds[0];
    logger.info('Channel found', { channelId, identifier: channelIdentifier });

    // Fetch channel data
    logger.info('Fetching channel data', { channelId });
    const channelData = await youtubeAPI.getChannelData(channelId);
    logger.info('Channel data fetched', {
      channelId,
      title: channelData.title,
      subscribers: channelData.subscriberCount,
      videoCount: channelData.videoCount
    });

    // Fetch videos
    logger.info('Fetching channel videos', { channelId, maxResults: Number(maxResults) });
    const videoIds = await youtubeAPI.getChannelVideos(channelId, Number(maxResults));
    logger.info('Video IDs fetched', { channelId, count: videoIds.length });

    const videosData = await youtubeAPI.getVideosDataBatch(videoIds);
    logger.info('Video data batch fetched', { channelId, videosCount: videosData.length });

    // Format response for frontend
    logger.info('Formatting response for frontend', { channelId, videoCount: videosData.length });

    return res.json({
      success: true,
      data: {
        channel: {
          id: channelData.channelId,
          title: channelData.title,
          customUrl: channelData.customUrl || `@${(channelData.title || '').replace(/\s+/g, '')}`,
          description: channelData.description,
          thumbnails: channelData.thumbnails,
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
          thumbnails: video.thumbnails,
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
// SPA ROUTING
// ============================================================================

// Serve index.html for all non-API routes (SPA routing)
// This must come BEFORE the 404 handler to allow React Router to handle client-side routes
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  // Skip API routes and static files
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }

  // Check for frontend build in multiple locations
  // In Docker: frontend is built to public/ directory
  // In local: frontend might be built to frontend/dist/
  const dockerIndexPath = path.join(__dirname, '../public/index.html');
  const localIndexPath = path.join(__dirname, '../frontend/dist/index.html');

  let indexPath: string | null = null;

  if (fs.existsSync(dockerIndexPath)) {
    indexPath = dockerIndexPath;
  } else if (fs.existsSync(localIndexPath)) {
    indexPath = localIndexPath;
  }

  if (indexPath) {
    // Production: serve the built React app
    res.sendFile(indexPath);
  } else {
    // Development: provide helpful message
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Development Mode</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 800px;
              margin: 50px auto;
              padding: 20px;
              line-height: 1.6;
            }
            code {
              background: #f4f4f4;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 14px;
            }
            .box {
              background: #f8f9fa;
              border-left: 4px solid #007bff;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <h1>🚧 Development Mode</h1>
          <p>You're accessing the backend server directly. In development mode, the frontend runs separately.</p>

          <div class="box">
            <h2>To access the application:</h2>
            <ol>
              <li>Make sure the frontend dev server is running:
                <br><code>cd frontend && npm run dev</code>
              </li>
              <li>Access the frontend at: <a href="http://localhost:5173">http://localhost:5173</a></li>
            </ol>
          </div>

          <div class="box">
            <h2>For production mode:</h2>
            <ol>
              <li>Build the frontend: <code>cd frontend && npm run build</code></li>
              <li>Then restart this server</li>
            </ol>
          </div>

          <p><strong>Current path:</strong> <code>${req.path}</code></p>
          <p><strong>Backend API:</strong> Available at <a href="/health">/health</a></p>
        </body>
      </html>
    `);
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
