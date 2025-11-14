/**
 * Algorithm Scoring Engine
 * Calculates algorithm performance scores based on 2025 YouTube criteria
 *
 * Scoring System (0-100):
 * - CTR Score: 0-25 points (25% weight)
 * - Watch Time Score: 0-35 points (35% weight)
 * - Engagement Score: 0-25 points (25% weight)
 * - Satisfaction Score: 0-15 points (15% weight)
 */

import { AlgorithmScore, ScoreGrade, Video } from '../types/models';
import logger from '../utils/logger';

export class AlgorithmScorerService {
  private static instance: AlgorithmScorerService;

  private constructor() {
    logger.info('Algorithm Scorer service initialized');
  }

  public static getInstance(): AlgorithmScorerService {
    if (!AlgorithmScorerService.instance) {
      AlgorithmScorerService.instance = new AlgorithmScorerService();
    }
    return AlgorithmScorerService.instance;
  }

  /**
   * Calculate complete algorithm score for a video
   */
  public calculateVideoScore(video: Video): AlgorithmScore {
    const ctrScore = this.scoreCTR(video.ctr, video.mainTrafficSource);
    const watchTimeScore = this.scoreWatchTime(
      video.avgPercentageViewed,
      video.avgViewDuration,
      video.duration,
      video.retentionAt15Seconds
    );
    const engagementScore = this.scoreEngagement(video);
    const satisfactionScore = this.scoreSatisfaction(
      video.satisfactionScore,
      video.negativeSignalRate
    );

    const overall = ctrScore + watchTimeScore + engagementScore + satisfactionScore;
    const grade = this.calculateGrade(overall);

    const strengths = this.identifyStrengths({
      ctrScore,
      watchTimeScore,
      engagementScore,
      satisfactionScore,
    });

    const weaknesses = this.identifyWeaknesses({
      ctrScore,
      watchTimeScore,
      engagementScore,
      satisfactionScore,
    });

    const opportunities = this.identifyOpportunities(
      { ctrScore, watchTimeScore, engagementScore, satisfactionScore },
      video
    );

    return {
      overall: Math.round(overall * 100) / 100,
      breakdown: {
        ctrScore: Math.round(ctrScore * 100) / 100,
        watchTimeScore: Math.round(watchTimeScore * 100) / 100,
        engagementScore: Math.round(engagementScore * 100) / 100,
        satisfactionScore: Math.round(satisfactionScore * 100) / 100,
      },
      strengths,
      weaknesses,
      opportunities,
      grade,
    };
  }

  /**
   * Calculate average algorithm score for a channel
   */
  public calculateChannelScore(videos: Video[]): AlgorithmScore {
    if (videos.length === 0) {
      return this.createEmptyScore();
    }

    const scores = videos.map((video) => this.calculateVideoScore(video));

    const avgOverall =
      scores.reduce((sum, score) => sum + score.overall, 0) / scores.length;
    const avgCTR =
      scores.reduce((sum, score) => sum + score.breakdown.ctrScore, 0) / scores.length;
    const avgWatchTime =
      scores.reduce((sum, score) => sum + score.breakdown.watchTimeScore, 0) / scores.length;
    const avgEngagement =
      scores.reduce((sum, score) => sum + score.breakdown.engagementScore, 0) / scores.length;
    const avgSatisfaction =
      scores.reduce((sum, score) => sum + score.breakdown.satisfactionScore, 0) / scores.length;

    const grade = this.calculateGrade(avgOverall);
    const strengths = this.identifyStrengths({
      ctrScore: avgCTR,
      watchTimeScore: avgWatchTime,
      engagementScore: avgEngagement,
      satisfactionScore: avgSatisfaction,
    });

    const weaknesses = this.identifyWeaknesses({
      ctrScore: avgCTR,
      watchTimeScore: avgWatchTime,
      engagementScore: avgEngagement,
      satisfactionScore: avgSatisfaction,
    });

    return {
      overall: Math.round(avgOverall * 100) / 100,
      breakdown: {
        ctrScore: Math.round(avgCTR * 100) / 100,
        watchTimeScore: Math.round(avgWatchTime * 100) / 100,
        engagementScore: Math.round(avgEngagement * 100) / 100,
        satisfactionScore: Math.round(avgSatisfaction * 100) / 100,
      },
      strengths,
      weaknesses,
      opportunities: [],
      grade,
    };
  }

  /**
   * Score CTR (0-25 points)
   * Benchmark: >10% for search, >5% for browse
   */
  private scoreCTR(ctr: number, trafficSource: string): number {
    const benchmark = trafficSource === 'search' ? 10 : 5;
    const percentage = (ctr / benchmark) * 100;

    // Award full points if at or above benchmark
    // Proportional points below benchmark
    // Bonus points up to 25 for exceptional performance
    let score = Math.min((percentage / 100) * 25, 25);

    // Exceptional performance bonus (>150% of benchmark)
    if (ctr > benchmark * 1.5) {
      score = Math.min(score * 1.1, 25);
    }

    return Math.max(0, score);
  }

  /**
   * Score Watch Time (0-35 points)
   * Breakdown:
   * - Retention rate: 0-20 points (>50% target)
   * - Absolute duration: 0-10 points (>8 min target for long-form)
   * - First 15 seconds: 0-5 points (>80% target)
   */
  private scoreWatchTime(
    retentionRate: number,
    avgViewDuration: number,
    videoDuration: number,
    retention15s: number
  ): number {
    // Retention rate score (0-20 points)
    const retentionTarget = 50;
    const retentionScore = Math.min((retentionRate / retentionTarget) * 20, 20);

    // Absolute duration score (0-10 points)
    // For videos >8 min, target is 8+ min watched
    // For shorter videos, proportional
    const durationTarget = Math.min(videoDuration, 480); // 8 minutes = 480 seconds
    const durationScore = Math.min((avgViewDuration / durationTarget) * 10, 10);

    // First 15 seconds critical score (0-5 points)
    const first15Target = 80;
    const first15Score = Math.min((retention15s / first15Target) * 5, 5);

    return Math.max(0, retentionScore + durationScore + first15Score);
  }

  /**
   * Score Engagement (0-25 points)
   * Target: >5% engagement rate
   */
  private scoreEngagement(video: Video): number {
    const totalEngagements = video.likes + video.comments + video.shares;
    const engagementRate = video.views > 0 ? (totalEngagements / video.views) * 100 : 0;

    const target = 5;
    const percentage = (engagementRate / target) * 100;

    // Base score
    let score = Math.min((percentage / 100) * 25, 25);

    // Bonus for comment-to-like ratio (indicates strong community)
    const commentRatio = video.likes > 0 ? video.comments / video.likes : 0;
    if (commentRatio > 0.1) {
      // >10% comment rate is excellent
      score = Math.min(score * 1.05, 25);
    }

    // Bonus for subscriber conversion
    if (video.subscribersGained > 0) {
      const subConversionRate = video.subscribersGained / (video.views / 1000);
      if (subConversionRate > 2) {
        // >2 subs per 1000 views
        score = Math.min(score * 1.05, 25);
      }
    }

    return Math.max(0, score);
  }

  /**
   * Score Satisfaction (0-15 points)
   * Based on survey data and negative signals
   */
  private scoreSatisfaction(
    satisfactionScore?: number,
    negativeSignalRate?: number
  ): number {
    // If no data available, give neutral score
    if (satisfactionScore === undefined && negativeSignalRate === undefined) {
      return 10; // Neutral assumption
    }

    let score = 15;

    // Survey satisfaction (if available)
    if (satisfactionScore !== undefined) {
      // Assuming satisfaction score is 0-100
      score = (satisfactionScore / 100) * 15;
    }

    // Negative signals penalty
    if (negativeSignalRate !== undefined) {
      // Each 1% of negative signals reduces score
      // Target: <10% negative signals
      if (negativeSignalRate > 10) {
        const penalty = (negativeSignalRate - 10) * 0.5;
        score -= penalty;
      }
    }

    return Math.max(0, Math.min(score, 15));
  }

  /**
   * Calculate letter grade from overall score
   */
  private calculateGrade(overall: number): ScoreGrade {
    if (overall >= 90) return 'A+';
    if (overall >= 80) return 'A';
    if (overall >= 70) return 'B+';
    if (overall >= 60) return 'B';
    if (overall >= 50) return 'C+';
    if (overall >= 40) return 'C';
    if (overall >= 30) return 'D';
    return 'F';
  }

  /**
   * Identify strengths based on score breakdown
   */
  private identifyStrengths(breakdown: {
    ctrScore: number;
    watchTimeScore: number;
    engagementScore: number;
    satisfactionScore: number;
  }): string[] {
    const strengths: string[] = [];

    if (breakdown.ctrScore >= 20) {
      strengths.push('Excellent click-through rate - thumbnails and titles are working well');
    }
    if (breakdown.watchTimeScore >= 28) {
      strengths.push('Strong watch time and retention - content keeps viewers engaged');
    }
    if (breakdown.engagementScore >= 20) {
      strengths.push('High engagement rate - audience is actively interacting');
    }
    if (breakdown.satisfactionScore >= 12) {
      strengths.push('High viewer satisfaction - low negative signals');
    }

    return strengths;
  }

  /**
   * Identify weaknesses based on score breakdown
   */
  private identifyWeaknesses(breakdown: {
    ctrScore: number;
    watchTimeScore: number;
    engagementScore: number;
    satisfactionScore: number;
  }): string[] {
    const weaknesses: string[] = [];

    if (breakdown.ctrScore < 12.5) {
      weaknesses.push('Low CTR - thumbnails and titles need optimization');
    }
    if (breakdown.watchTimeScore < 17.5) {
      weaknesses.push('Poor watch time - content structure and retention need improvement');
    }
    if (breakdown.engagementScore < 12.5) {
      weaknesses.push('Low engagement - need stronger calls-to-action and community building');
    }
    if (breakdown.satisfactionScore < 7.5) {
      weaknesses.push('Low satisfaction - high negative signals or poor viewer response');
    }

    return weaknesses;
  }

  /**
   * Identify opportunities for improvement
   */
  private identifyOpportunities(
    breakdown: {
      ctrScore: number;
      watchTimeScore: number;
      engagementScore: number;
      satisfactionScore: number;
    },
    video: Video
  ): string[] {
    const opportunities: string[] = [];

    // CTR opportunities
    if (breakdown.ctrScore < 18 && breakdown.ctrScore > 10) {
      opportunities.push('CTR is decent but has room for improvement - A/B test thumbnails');
    }

    // Retention opportunities
    if (video.retentionAt15Seconds < 70) {
      opportunities.push('First 15 seconds need stronger hook - this is critical for algorithm');
    }

    // Engagement opportunities
    if (video.comments < video.likes * 0.05) {
      opportunities.push('Low comment rate - add conversation starters and questions');
    }

    // Shorts opportunity
    if (!video.isShort && video.duration > 600) {
      opportunities.push('Create Shorts from this content to increase discovery');
    }

    return opportunities;
  }

  /**
   * Create empty score for channels with no data
   */
  private createEmptyScore(): AlgorithmScore {
    return {
      overall: 0,
      breakdown: {
        ctrScore: 0,
        watchTimeScore: 0,
        engagementScore: 0,
        satisfactionScore: 0,
      },
      strengths: [],
      weaknesses: ['No data available for scoring'],
      opportunities: [],
      grade: 'F',
    };
  }

  /**
   * Compare score against benchmark
   */
  public compareAgainstBenchmark(
    score: number,
    benchmark: number
  ): {
    status: 'above' | 'at' | 'below';
    gap: number;
    percentage: number;
  } {
    const gap = score - benchmark;
    const percentage = benchmark > 0 ? (gap / benchmark) * 100 : 0;

    let status: 'above' | 'at' | 'below';
    if (Math.abs(gap) < 0.5) {
      status = 'at';
    } else if (gap > 0) {
      status = 'above';
    } else {
      status = 'below';
    }

    return { status, gap, percentage };
  }
}

export const algorithmScorer = AlgorithmScorerService.getInstance();
export default algorithmScorer;
