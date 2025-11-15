/**
 * Application Configuration
 * Centralized configuration management with validation
 */

import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

// Load environment variables
loadEnv();

// Configuration schema with validation
const configSchema = z.object({
  // Application
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().int().positive().default(3000),
  apiBaseUrl: z.string().url().default('http://localhost:3000'),

  // YouTube API
  youtube: z.object({
    apiKey: z.string().min(1, 'YouTube API key is required'),
    clientId: z.string().min(1, 'YouTube Client ID is required'),
    clientSecret: z.string().min(1, 'YouTube Client Secret is required'),
    redirectUri: z.string().url(),
  }),

  // AI Services
  ai: z.object({
    provider: z.enum(['openrouter', 'anthropic', 'openai', 'google']).default('openrouter'),
    openrouter: z.object({
      apiKey: z.string().optional(),
      model: z.string().default('anthropic/claude-sonnet-4-20250514'),
      temperatureAnalytical: z.coerce.number().min(0).max(1).default(0.3),
      temperatureCreative: z.coerce.number().min(0).max(1).default(0.6),
      maxTokens: z.coerce.number().int().positive().default(4000),
      baseUrl: z.string().url().default('https://openrouter.ai/api/v1'),
    }),
    anthropic: z.object({
      apiKey: z.string().optional(),
      model: z.string().default('claude-sonnet-4-20250514'),
      temperatureAnalytical: z.coerce.number().min(0).max(1).default(0.3),
      temperatureCreative: z.coerce.number().min(0).max(1).default(0.6),
      maxTokens: z.coerce.number().int().positive().default(4000),
    }),
    openai: z
      .object({
        apiKey: z.string().optional(),
        model: z.string().default('gpt-4'),
      })
      .optional(),
    google: z
      .object({
        apiKey: z.string().optional(),
        model: z.string().default('gemini-pro'),
      })
      .optional(),
  }),

  // Database - PostgreSQL
  postgres: z.object({
    host: z.string().default('localhost'),
    port: z.coerce.number().int().positive().default(5432),
    database: z.string().default('yt_ai_analyst'),
    user: z.string().default('postgres'),
    password: z.string().min(1, 'PostgreSQL password is required'),
    url: z.string().url(),
  }),

  // Database - MongoDB
  mongodb: z.object({
    uri: z.string().url(),
    database: z.string().default('yt_ai_analyst'),
  }),

  // Redis
  redis: z.object({
    host: z.string().default('localhost'),
    port: z.coerce.number().int().positive().default(6379),
    password: z.string().optional(),
    url: z.string().url(),
  }),

  // Security
  security: z.object({
    jwtSecret: z.string().min(32, 'JWT secret must be at least 32 characters'),
    jwtExpiry: z.string().default('7d'),
    bcryptRounds: z.coerce.number().int().min(10).max(15).default(12),
  }),

  // Rate Limiting
  rateLimit: z.object({
    windowMs: z.coerce.number().int().positive().default(900000), // 15 minutes
    maxRequests: z.coerce.number().int().positive().default(100),
  }),

  // Logging
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    filePath: z.string().default('./logs/app.log'),
  }),

  // Background Jobs
  jobs: z.object({
    redisHost: z.string().default('localhost'),
    redisPort: z.coerce.number().int().positive().default(6379),
  }),

  // Data Collection
  dataCollection: z.object({
    intervalHours: z.coerce.number().int().positive().default(6),
    retentionDays: z.coerce.number().int().positive().default(90),
  }),

  // Features
  features: z.object({
    enableShortsAnalysis: z.coerce.boolean().default(true),
    enableCompetitorAnalysis: z.coerce.boolean().default(false),
    enableRealtimeUpdates: z.coerce.boolean().default(true),
  }),

  // Monitoring
  monitoring: z.object({
    sentryDsn: z.string().optional(),
    datadogApiKey: z.string().optional(),
  }),
});

// Parse and validate configuration
function loadConfig() {
  try {
    const rawConfig = {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      apiBaseUrl: process.env.API_BASE_URL,

      youtube: {
        apiKey: process.env.YOUTUBE_API_KEY,
        clientId: process.env.YOUTUBE_CLIENT_ID,
        clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
        redirectUri: process.env.YOUTUBE_REDIRECT_URI,
      },

      ai: {
        provider: process.env.AI_PROVIDER,
        openrouter: {
          apiKey: process.env.OPENROUTER_API_KEY,
          model: process.env.OPENROUTER_MODEL || process.env.AI_PRIMARY_MODEL,
          temperatureAnalytical: process.env.AI_TEMPERATURE_ANALYTICAL,
          temperatureCreative: process.env.AI_TEMPERATURE_CREATIVE,
          maxTokens: process.env.AI_MAX_TOKENS,
          baseUrl: process.env.OPENROUTER_BASE_URL,
        },
        anthropic: {
          apiKey: process.env.ANTHROPIC_API_KEY,
          model: process.env.AI_PRIMARY_MODEL,
          temperatureAnalytical: process.env.AI_TEMPERATURE_ANALYTICAL,
          temperatureCreative: process.env.AI_TEMPERATURE_CREATIVE,
          maxTokens: process.env.AI_MAX_TOKENS,
        },
        openai: process.env.OPENAI_API_KEY
          ? {
              apiKey: process.env.OPENAI_API_KEY,
              model: 'gpt-4',
            }
          : undefined,
        google: process.env.GOOGLE_AI_API_KEY
          ? {
              apiKey: process.env.GOOGLE_AI_API_KEY,
              model: 'gemini-pro',
            }
          : undefined,
      },

      postgres: {
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        database: process.env.POSTGRES_DB,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        url: process.env.DATABASE_URL,
      },

      mongodb: {
        uri: process.env.MONGODB_URI,
        database: process.env.MONGODB_DB,
      },

      redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        url: process.env.REDIS_URL,
      },

      security: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiry: process.env.JWT_EXPIRY,
        bcryptRounds: process.env.BCRYPT_ROUNDS,
      },

      rateLimit: {
        windowMs: process.env.RATE_LIMIT_WINDOW_MS,
        maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
      },

      logging: {
        level: process.env.LOG_LEVEL,
        filePath: process.env.LOG_FILE_PATH,
      },

      jobs: {
        redisHost: process.env.BULL_REDIS_HOST,
        redisPort: process.env.BULL_REDIS_PORT,
      },

      dataCollection: {
        intervalHours: process.env.DATA_COLLECTION_INTERVAL_HOURS,
        retentionDays: process.env.ANALYTICS_RETENTION_DAYS,
      },

      features: {
        enableShortsAnalysis: process.env.ENABLE_SHORTS_ANALYSIS,
        enableCompetitorAnalysis: process.env.ENABLE_COMPETITOR_ANALYSIS,
        enableRealtimeUpdates: process.env.ENABLE_REALTIME_UPDATES,
      },

      monitoring: {
        sentryDsn: process.env.SENTRY_DSN,
        datadogApiKey: process.env.DATADOG_API_KEY,
      },
    };

    return configSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid configuration. Please check your environment variables.');
    }
    throw error;
  }
}

// Export validated configuration
export const config = loadConfig();

// Type export for use throughout the application
export type AppConfig = z.infer<typeof configSchema>;
