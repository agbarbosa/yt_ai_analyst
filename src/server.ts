/**
 * Express API Server
 * Main application entry point
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
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

// Security headers
app.use(helmet());

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

// ============================================================================
// ROUTES
// ============================================================================

/**
 * Health check
 */
app.get('/health', async (req: Request, res: Response) => {
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

    res.json({
      query: q,
      results: channels,
      count: channels.length,
    });
  } catch (error) {
    logger.error('Channel search failed', { error });
    res.status(500).json({
      error: 'Failed to search channels',
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
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
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
