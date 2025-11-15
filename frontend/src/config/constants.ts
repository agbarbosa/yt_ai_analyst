export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'YouTube AI Analyst';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

export const API_ENDPOINTS = {
  VIDEO: '/api/video',
  CHANNEL: '/api/channel',
  ANALYTICS: '/api/analytics',
  RECOMMENDATIONS: '/api/recommendations',
} as const;

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  VIDEO_ANALYSIS: '/video/:id',
  CHANNEL_ANALYSIS: '/channel/:id',
  RECOMMENDATIONS: '/recommendations',
  SETTINGS: '/settings',
} as const;

export const VIDEO_CATEGORIES = [
  'All',
  'Music',
  'Gaming',
  'Education',
  'Entertainment',
  'News & Politics',
  'Science & Technology',
  'Sports',
] as const;

export const TIME_RANGES = {
  '24h': { label: '24 Hours', value: '24h' },
  '7d': { label: '7 Days', value: '7d' },
  '30d': { label: '30 Days', value: '30d' },
  '90d': { label: '90 Days', value: '90d' },
  '1y': { label: '1 Year', value: '1y' },
} as const;
