/**
 * Logging Utility
 * Winston-based structured logging
 */

import winston from 'winston';
import { config } from '../config';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Define colors for console output
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(colors);

// Custom format for structured logging
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  levels,
  level: config.logging.level,
  format: customFormat,
  defaultMeta: { service: 'yt-ai-analyst' },
  transports: [
    // File transport for all logs
    new winston.transports.File({
      filename: config.logging.filePath,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // Separate file for errors
    new winston.transports.File({
      filename: config.logging.filePath.replace('.log', '-error.log'),
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5,
    }),
  ],
});

// Add console transport in development
if (config.nodeEnv === 'development') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Helper functions for common log patterns
export const logAPICall = (method: string, endpoint: string, duration?: number) => {
  logger.info('API Call', { method, endpoint, duration });
};

export const logYouTubeAPI = (operation: string, resourceId: string, success: boolean) => {
  logger.info('YouTube API', { operation, resourceId, success });
};

export const logAIGeneration = (
  model: string,
  category: string,
  tokensUsed?: number,
  duration?: number
) => {
  logger.info('AI Generation', { model, category, tokensUsed, duration });
};

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

export const logDataCollection = (channelId: string, videosCollected: number, success: boolean) => {
  logger.info('Data Collection', { channelId, videosCollected, success });
};

export default logger;
