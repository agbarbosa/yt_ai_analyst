/**
 * Recommendation Engine
 * Generates AI-powered recommendations for channels and videos
 */

import {
  Recommendation,
  RecommendationCategory,
  RecommendationPriority,
  Video,
  Channel,
  AlgorithmScore,
  PerformanceGap,
  AIModel,
  ActionItem,
  EffortLevel,
  ImpactEstimate,
} from '../types/models';
import { aiService } from './ai-service';
import { algorithmScorer } from './algorithm-scorer';
import {
  buildPrompt,
  PROMPT_TEMPLATES,
  YOUTUBE_ALGORITHM_EXPERT_SYSTEM_PROMPT,
} from '../ai/prompts';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

export class RecommendationEngine {
  private static instance: RecommendationEngine;

  private constructor() {
    logger.info('Recommendation Engine initialized');
  }

  public static getInstance(): RecommendationEngine {
    if (!RecommendationEngine.instance) {
      RecommendationEngine.instance = new RecommendationEngine();
    }
    return RecommendationEngine.instance;
  }

  /**
   * Generate recommendations for a video
   */
  public async generateVideoRecommendations(
    video: Video,
    algorithmScore: AlgorithmScore
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    try {
      logger.info('Generating video recommendations', { videoId: video.videoId });

      // Identify performance gaps
      logger.info('Identifying performance gaps', { videoId: video.videoId });
      const gaps = this.identifyVideoPerformanceGaps(video, algorithmScore);
      logger.info('Performance gaps identified', {
        videoId: video.videoId,
        gapCount: gaps.length,
        criticalGaps: gaps.filter(g => g.severity === 'critical').length,
        highGaps: gaps.filter(g => g.severity === 'high').length
      });

      // Generate recommendations for each significant gap
      for (const gap of gaps) {
        if (gap.severity === 'critical' || gap.severity === 'high') {
          const recommendation = await this.generateRecommendationForGap(
            gap,
            video,
            'video'
          );
          recommendations.push(recommendation);
        }
      }

      // Always check first 15 seconds if retention is below 80%
      if (video.retentionAt15Seconds < 80) {
        const hookRecommendation = await this.generateHookRecommendation(video);
        recommendations.push(hookRecommendation);
      }

      logger.info('Video recommendations generated', {
        videoId: video.videoId,
        count: recommendations.length,
      });

      return this.prioritizeRecommendations(recommendations);
    } catch (error) {
      logger.error('Failed to generate video recommendations', {
        videoId: video.videoId,
        error,
      });
      throw error;
    }
  }

  /**
   * Generate recommendations for a channel
   */
  public async generateChannelRecommendations(
    channel: Channel | Partial<Channel>,
    recentVideos: Video[]
  ): Promise<Recommendation[]> {
    try {
      // Ensure channelId is present
      if (!channel.channelId) {
        throw new Error('Channel ID is required for generating recommendations');
      }

      const channelId = channel.channelId;
      logger.info('Generating channel recommendations', { channelId });

      // Calculate channel algorithm score
      const channelScore = algorithmScorer.calculateChannelScore(recentVideos);

      // Calculate average metrics from recent videos if not provided
      const avgCTR = channel.avgCTR ?? this.calculateAvgCTR(recentVideos);
      const avgRetentionRate = channel.avgRetentionRate ?? this.calculateAvgRetention(recentVideos);
      const avgEngagementRate = channel.avgEngagementRate ?? this.calculateAvgEngagement(recentVideos);
      const primaryTopics = channel.primaryTopics ?? [];
      const uploadFrequency = channel.uploadFrequency ?? 'irregular';
      const createdAt = channel.createdAt ?? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // Default to 1 year ago
      const shortsPercentage = channel.shortsPercentage ?? this.calculateShortsPercentage(recentVideos);

      // Build prompt with channel data
      const promptData = {
        channelName: channel.title || 'Unknown Channel',
        subscriberCount: (channel.subscriberCount ?? 0).toLocaleString(),
        videoCount: channel.videoCount ?? recentVideos.length,
        niche: primaryTopics[0] || 'general',
        uploadFrequency: uploadFrequency,
        channelAge: this.calculateChannelAge(createdAt),
        algorithmScore: channelScore.overall,
        scoreGrade: channelScore.grade,
        avgCTR: avgCTR,
        ctrBenchmark: 5.0,
        ctrGap: (5.0 - avgCTR).toFixed(1),
        ctrStatus: avgCTR >= 5 ? '✓ Above benchmark' : '✗ Below benchmark',
        avgRetention: avgRetentionRate,
        retentionBenchmark: 50.0,
        retentionGap: (50.0 - avgRetentionRate).toFixed(1),
        retentionStatus:
          avgRetentionRate >= 50 ? '✓ Above benchmark' : '✗ Below benchmark',
        avgEngagement: avgEngagementRate,
        engagementBenchmark: 5.0,
        engagementGap: (5.0 - avgEngagementRate).toFixed(1),
        engagementStatus:
          avgEngagementRate >= 5 ? '✓ Above benchmark' : '✗ Below benchmark',
        subGrowthRate: '0', // TODO: Calculate from historical data
        viewsGrowthRate: '0',
        growthTrend: 'stable',
        topTopics: this.formatTopics(primaryTopics),
        weakTopics: 'To be analyzed',
        longformPercentage: (100 - shortsPercentage).toFixed(1),
        midformPercentage: '0',
        shortsPercentage: shortsPercentage.toFixed(1),
        topVideos: this.formatTopVideos(recentVideos.slice(0, 5)),
        bottomVideos: this.formatBottomVideos(recentVideos.slice(-5)),
      };

      const prompt = buildPrompt(
        PROMPT_TEMPLATES.upload_schedule.template,
        promptData,
        YOUTUBE_ALGORITHM_EXPERT_SYSTEM_PROMPT
      );

      logger.info('Calling AI service for recommendations', {
        channelId,
        promptLength: prompt.length,
        temperature: 0.3,
        maxTokens: 4000
      });

      const result = await aiService.generateWithRetry(prompt, {
        temperature: 0.3,
        maxTokens: 4000,
      });

      logger.info('AI service response received', {
        channelId,
        model: result.model,
        contentLength: result.content.length,
        tokensUsed: result.tokensUsed
      });

      // Parse AI response into recommendations
      logger.info('Parsing AI recommendations', { channelId });
      const recommendations = this.parseRecommendationsFromAI(
        result.content,
        channelId,
        'channel',
        result.model
      );

      logger.info('Channel recommendations generated', {
        channelId,
        count: recommendations.length,
      });

      return recommendations;
    } catch (error) {
      logger.error('Failed to generate channel recommendations', {
        channelId: channel.channelId || 'unknown',
        error,
      });
      throw error;
    }
  }

  /**
   * Generate title optimization recommendations
   */
  public async optimizeTitle(video: Video): Promise<string[]> {
    try {
      const promptData = {
        currentTitle: video.title,
        topic: video.category || 'general',
        audience: 'general',
        duration: this.formatDuration(video.duration),
        contentType: video.isShort ? 'Short' : 'Long-form',
        niche: video.category || 'general',
        ctr: video.ctr.toFixed(2),
        ctrBenchmark: '5.0',
        gap: (5.0 - video.ctr).toFixed(1),
        trafficSource: video.mainTrafficSource,
        views: video.views.toLocaleString(),
        impressions: video.impressions.toLocaleString(),
        keywords: video.keywords.join(', ') || video.tags.slice(0, 5).join(', '),
        searchVolume: 'Medium',
        competition: 'Medium',
        ranking: 'Unknown',
        competitorTitles: 'To be analyzed',
      };

      const prompt = buildPrompt(
        PROMPT_TEMPLATES.title_optimization.template,
        promptData,
        YOUTUBE_ALGORITHM_EXPERT_SYSTEM_PROMPT
      );

      const result = await aiService.generateWithRetry(prompt, {
        temperature: 0.6,
        maxTokens: 2500,
      });

      // Extract titles from response
      return this.extractTitlesFromResponse(result.content);
    } catch (error) {
      logger.error('Failed to optimize title', { videoId: video.videoId, error });
      throw error;
    }
  }

  /**
   * Identify performance gaps for a video
   */
  private identifyVideoPerformanceGaps(
    video: Video,
    _score: AlgorithmScore
  ): PerformanceGap[] {
    const gaps: PerformanceGap[] = [];

    // CTR gap
    const ctrBenchmark = video.mainTrafficSource === 'search' ? 10 : 5;
    if (video.ctr < ctrBenchmark) {
      gaps.push({
        category: 'title_optimization',
        metric: 'CTR',
        currentValue: video.ctr,
        benchmarkValue: ctrBenchmark,
        gap: ((ctrBenchmark - video.ctr) / ctrBenchmark) * 100,
        severity: video.ctr < ctrBenchmark * 0.5 ? 'critical' : 'high',
        description: `CTR is ${video.ctr.toFixed(1)}%, below the ${ctrBenchmark}% benchmark`,
      });
    }

    // Retention gap
    if (video.avgPercentageViewed < 50) {
      gaps.push({
        category: 'retention_improvement',
        metric: 'Retention Rate',
        currentValue: video.avgPercentageViewed,
        benchmarkValue: 50,
        gap: ((50 - video.avgPercentageViewed) / 50) * 100,
        severity: video.avgPercentageViewed < 30 ? 'critical' : 'high',
        description: `Retention is ${video.avgPercentageViewed.toFixed(1)}%, below the 50% benchmark`,
      });
    }

    // Engagement gap
    const engagementRate =
      ((video.likes + video.comments + video.shares) / video.views) * 100;
    if (engagementRate < 5) {
      gaps.push({
        category: 'engagement_tactics',
        metric: 'Engagement Rate',
        currentValue: engagementRate,
        benchmarkValue: 5,
        gap: ((5 - engagementRate) / 5) * 100,
        severity: engagementRate < 2 ? 'high' : 'medium',
        description: `Engagement rate is ${engagementRate.toFixed(1)}%, below the 5% benchmark`,
      });
    }

    return gaps;
  }

  /**
   * Generate recommendation for a specific performance gap
   */
  private async generateRecommendationForGap(
    gap: PerformanceGap,
    context: Video | Channel,
    targetType: 'video' | 'channel'
  ): Promise<Recommendation> {
    // Create a basic recommendation based on the gap
    // In production, this would use AI to generate detailed recommendations
    return {
      id: uuidv4(),
      targetId: targetType === 'video' ? (context as Video).videoId : (context as Channel).channelId,
      targetType,
      category: gap.category as RecommendationCategory,
      priority: gap.severity === 'critical' ? 'critical' : 'high',
      title: `Improve ${gap.metric}`,
      description: gap.description,
      actionItems: this.generateActionItems(gap),
      expectedImpact: {
        metric: gap.metric,
        currentValue: gap.currentValue,
        projectedValue: gap.benchmarkValue,
        improvement: gap.gap,
        confidence: 0.7,
        timeframe: '2-4 weeks',
      },
      generatedBy: this.getConfiguredModel(),
      reasoning: `Identified performance gap: ${gap.description}`,
      prompt: '',
      confidence: 0.7,
      status: 'pending',
      createdAt: new Date(),
    };
  }

  /**
   * Generate hook recommendation for low first 15s retention
   */
  private async generateHookRecommendation(video: Video): Promise<Recommendation> {
    return {
      id: uuidv4(),
      targetId: video.videoId,
      targetType: 'video',
      category: 'retention_improvement',
      priority: 'critical',
      title: 'Optimize First 15 Seconds Hook',
      description: `First 15-second retention is ${video.retentionAt15Seconds.toFixed(1)}%, significantly below the 80% target. This is the most critical factor for algorithm success in 2025.`,
      actionItems: [
        {
          action: 'Remove intro fluff',
          details: 'Cut any logos, intros, or greetings. Start with immediate value or pattern interrupt.',
          effort: 'low',
          timeline: '15 minutes',
          order: 1,
        },
        {
          action: 'Create strong hook',
          details: 'Use one of: Bold claim, shocking stat, question, or visual pattern interrupt in first 3 seconds.',
          effort: 'medium',
          timeline: '30 minutes',
          order: 2,
        },
        {
          action: 'State value proposition',
          details: 'Tell viewers what they will learn/gain in seconds 4-8.',
          effort: 'low',
          timeline: '10 minutes',
          order: 3,
        },
      ],
      expectedImpact: {
        metric: 'First 15s Retention',
        currentValue: video.retentionAt15Seconds,
        projectedValue: 75,
        improvement: ((75 - video.retentionAt15Seconds) / video.retentionAt15Seconds) * 100,
        confidence: 0.8,
        timeframe: '1-2 weeks',
      },
      generatedBy: this.getConfiguredModel(),
      reasoning: 'First 15 seconds are critical decision point for 70% of viewers in 2025 algorithm',
      prompt: '',
      confidence: 0.85,
      status: 'pending',
      createdAt: new Date(),
    };
  }

  /**
   * Generate generic action items for a gap
   */
  private generateActionItems(gap: PerformanceGap) {
    return [
      {
        action: `Address ${gap.metric} issue`,
        details: gap.description,
        effort: 'medium' as const,
        timeline: '1-2 weeks',
        order: 1,
      },
    ];
  }

  /**
   * Prioritize recommendations
   */
  private prioritizeRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

    return recommendations.sort((a, b) => {
      // First by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by expected impact
      return b.expectedImpact.improvement - a.expectedImpact.improvement;
    });
  }

  /**
   * Parse recommendations from AI response
   */
  private parseRecommendationsFromAI(
    content: string,
    targetId: string,
    targetType: 'channel' | 'video',
    model: string
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    try {
      // Try JSON parsing first
      const parsed = JSON.parse(content);

      if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
        // Process each recommendation from the JSON array
        for (const rec of parsed.recommendations) {
          // Map category string to enum format
          const category = this.mapCategoryToEnum(rec.category);

          // Build action items from detailed description
          const actionItems = this.extractActionItems(
            rec.detailedDescription,
            rec.effortLevel,
            rec.timeline.implementation
          );

          // Build expected impact from success metric
          const expectedImpact: ImpactEstimate = {
            metric: rec.successMetric.metric,
            currentValue: rec.successMetric.currentValue,
            projectedValue: rec.successMetric.targetValue,
            improvement: this.calculateImprovement(
              rec.successMetric.currentValue,
              rec.successMetric.targetValue
            ),
            confidence: this.mapConfidenceLevel(rec.successMetric.confidenceLevel),
            timeframe: rec.timeline.resultsTimeframe,
            measurementMethod: rec.successMetric.measurementMethod,
          };

          // Map confidence level to numeric value
          const confidence = this.mapConfidenceLevel(rec.successMetric.confidenceLevel);

          recommendations.push({
            id: uuidv4(),
            targetId,
            targetType,
            category,
            priority: rec.priority.toLowerCase() as RecommendationPriority,
            title: rec.summary,
            description: rec.detailedDescription,
            actionItems,
            expectedImpact,
            projectValue: rec.projectValue,
            generatedBy: model as any,
            reasoning: rec.reasoning,
            prompt: '',
            confidence,
            status: 'pending',
            createdAt: new Date(),
          });
        }

        console.log(`Successfully parsed ${recommendations.length} recommendations from JSON`);
        return recommendations;
      } else {
        throw new Error('Invalid JSON structure: missing recommendations array');
      }
    } catch (error) {
      // Fallback to markdown parsing for backward compatibility
      console.warn('JSON parsing failed, using markdown fallback:', error);
      return this.parseMarkdownRecommendations(content, targetId, targetType, model);
    }
  }

  /**
   * Map category string to enum format
   */
  private mapCategoryToEnum(category: string): RecommendationCategory {
    const categoryMap: Record<string, RecommendationCategory> = {
      'Title Optimization': 'title_optimization',
      'Thumbnail Improvement': 'thumbnail_improvement',
      'Content Structure': 'content_structure',
      'Engagement Tactics': 'engagement_tactics',
      'SEO Keywords': 'seo_keywords',
      'Upload Schedule': 'upload_schedule',
      'Shorts Strategy': 'shorts_strategy',
      'Audience Targeting': 'audience_targeting',
      'Retention Improvement': 'retention_improvement',
      'CTA Optimization': 'cta_optimization',
      'Topic Selection': 'topic_selection',
      'Collaboration': 'collaboration',
    };

    return categoryMap[category] || 'content_structure';
  }

  /**
   * Extract action items from detailed description
   */
  private extractActionItems(
    detailedDescription: string,
    effortLevel: string,
    timeline: string
  ): ActionItem[] {
    const actionItems: ActionItem[] = [];

    // Try to extract numbered action items from the description
    const numberedPattern = /\d+\)\s+([^.]+?)(?:\s*\(([^)]+)\))?[.\n]/g;
    let match;
    let order = 1;

    while ((match = numberedPattern.exec(detailedDescription)) !== null) {
      actionItems.push({
        action: match[1].trim(),
        details: match[1].trim(),
        effort: effortLevel.toLowerCase() as EffortLevel,
        timeline: match[2] || timeline,
        order: order++,
      });
    }

    // If no numbered items found, create a single action item
    if (actionItems.length === 0) {
      actionItems.push({
        action: 'Implement recommendation',
        details: detailedDescription,
        effort: effortLevel.toLowerCase() as EffortLevel,
        timeline,
        order: 1,
      });
    }

    return actionItems;
  }

  /**
   * Calculate percentage improvement
   */
  private calculateImprovement(currentValue: number, targetValue: number): number {
    if (currentValue === 0) return 0;
    return ((targetValue - currentValue) / currentValue) * 100;
  }

  /**
   * Map confidence level string to numeric value
   */
  private mapConfidenceLevel(confidenceLevel: string): number {
    const confidenceMap: Record<string, number> = {
      Low: 0.5,
      Medium: 0.7,
      High: 0.9,
    };
    return confidenceMap[confidenceLevel] || 0.7;
  }

  /**
   * Fallback: Parse markdown recommendations (old format)
   */
  private parseMarkdownRecommendations(
    content: string,
    targetId: string,
    targetType: 'channel' | 'video',
    model: string
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // For now, create a single recommendation with the full AI response
    recommendations.push({
      id: uuidv4(),
      targetId,
      targetType,
      category: 'content_structure',
      priority: 'high',
      title: 'AI-Generated Channel Strategy',
      description: content.substring(0, 500) + '...',
      actionItems: [
        {
          action: 'Review full AI recommendations',
          details: content,
          effort: 'high',
          timeline: '1-2 weeks',
          order: 1,
        },
      ],
      expectedImpact: {
        metric: 'Overall Performance',
        currentValue: 0,
        projectedValue: 0,
        improvement: 0,
        confidence: 0.7,
        timeframe: '4-8 weeks',
      },
      generatedBy: model as any,
      reasoning: 'AI-generated comprehensive strategy',
      prompt: '',
      confidence: 0.75,
      status: 'pending',
      createdAt: new Date(),
    });

    return recommendations;
  }

  /**
   * Helper: Format duration
   */
  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Helper: Calculate channel age
   */
  private calculateChannelAge(createdAt: Date): string {
    const now = new Date();
    const ageInMs = now.getTime() - createdAt.getTime();
    const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));

    if (ageInDays < 30) return `${ageInDays} days`;
    if (ageInDays < 365) return `${Math.floor(ageInDays / 30)} months`;
    return `${Math.floor(ageInDays / 365)} years`;
  }

  /**
   * Helper: Format topics
   */
  private formatTopics(topics: string[]): string {
    return topics.length > 0 ? topics.join(', ') : 'Not analyzed yet';
  }

  /**
   * Helper: Format top videos
   */
  private formatTopVideos(videos: Video[]): string {
    return videos
      .map((v, i) => `${i + 1}. "${v.title}" - ${v.views.toLocaleString()} views, ${v.ctr.toFixed(1)}% CTR`)
      .join('\n');
  }

  /**
   * Helper: Format bottom videos
   */
  private formatBottomVideos(videos: Video[]): string {
    return videos
      .map((v, i) => `${i + 1}. "${v.title}" - ${v.views.toLocaleString()} views, ${v.ctr.toFixed(1)}% CTR`)
      .join('\n');
  }

  /**
   * Helper: Extract titles from AI response
   */
  private extractTitlesFromResponse(content: string): string[] {
    // Simple extraction - looks for numbered titles
    const titlePattern = /(?:Title \d+|^\d+\.)\s*[:\-]?\s*(.+)$/gm;
    const matches = [...content.matchAll(titlePattern)];

    return matches.map((match) => match[1].trim()).filter((title) => title.length > 0);
  }

  /**
   * Helper: Calculate average CTR from videos
   */
  private calculateAvgCTR(videos: Partial<Video>[]): number {
    if (videos.length === 0) return 0;
    const validVideos = videos.filter(v => v.ctr !== undefined);
    if (validVideos.length === 0) return 0;
    const sum = validVideos.reduce((acc, v) => acc + (v.ctr || 0), 0);
    return sum / validVideos.length;
  }

  /**
   * Helper: Calculate average retention from videos
   */
  private calculateAvgRetention(videos: Partial<Video>[]): number {
    if (videos.length === 0) return 0;
    const validVideos = videos.filter(v => v.avgPercentageViewed !== undefined);
    if (validVideos.length === 0) return 0;
    const sum = validVideos.reduce((acc, v) => acc + (v.avgPercentageViewed || 0), 0);
    return sum / validVideos.length;
  }

  /**
   * Helper: Calculate average engagement rate from videos
   */
  private calculateAvgEngagement(videos: Partial<Video>[]): number {
    if (videos.length === 0) return 0;
    const validVideos = videos.filter(v =>
      v.views !== undefined &&
      v.likes !== undefined &&
      v.comments !== undefined &&
      v.views > 0
    );
    if (validVideos.length === 0) return 0;

    const engagementRates = validVideos.map(v => {
      const shares = v.shares || 0;
      const engagement = ((v.likes! + v.comments! + shares) / v.views!) * 100;
      return engagement;
    });

    const sum = engagementRates.reduce((acc, rate) => acc + rate, 0);
    return sum / engagementRates.length;
  }

  /**
   * Helper: Calculate shorts percentage from videos
   */
  private calculateShortsPercentage(videos: Partial<Video>[]): number {
    if (videos.length === 0) return 0;
    const shortsCount = videos.filter(v => v.isShort === true).length;
    return (shortsCount / videos.length) * 100;
  }

  /**
   * Helper: Get the configured AI model based on provider
   */
  private getConfiguredModel(): AIModel {
    switch (config.ai.provider) {
      case 'openrouter':
        return config.ai.openrouter.model as AIModel;
      case 'anthropic':
        return config.ai.anthropic.model as AIModel;
      case 'openai':
        return config.ai.openai.model as AIModel;
      case 'google':
        return (config.ai.google?.model || 'gemini-pro') as AIModel;
      default:
        return 'claude-sonnet-4.5';
    }
  }
}

export const recommendationEngine = RecommendationEngine.getInstance();
export default recommendationEngine;
