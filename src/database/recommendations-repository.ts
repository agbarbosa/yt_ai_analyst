/**
 * Recommendations Repository
 * Handles database operations for AI-generated recommendations
 */

import { db } from './postgres';
import { Recommendation } from '../types/models';
import logger from '../utils/logger';

export class RecommendationsRepository {
  /**
   * Save algorithm score for a channel snapshot
   */
  async saveAlgorithmScore(channelId: string, algorithmScore: any, createdAt: Date): Promise<void> {
    try {
      await db.query(
        `INSERT INTO channel_snapshots (channel_id, algorithm_score, created_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (channel_id, created_at) DO UPDATE SET
           algorithm_score = EXCLUDED.algorithm_score`,
        [channelId, JSON.stringify(algorithmScore), createdAt]
      );

      logger.info('Algorithm score saved to database', { channelId });
    } catch (error) {
      logger.error('Failed to save algorithm score', { error, channelId });
      throw error;
    }
  }

  /**
   * Get algorithm score for latest channel snapshot
   */
  async getLatestAlgorithmScore(channelId: string): Promise<any | null> {
    try {
      const result = await db.query(
        `SELECT algorithm_score, created_at
         FROM channel_snapshots
         WHERE channel_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [channelId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return typeof row.algorithm_score === 'string'
        ? JSON.parse(row.algorithm_score)
        : row.algorithm_score;
    } catch (error) {
      logger.error('Failed to get algorithm score', { error, channelId });
      throw error;
    }
  }

  /**
   * Save recommendations to database
   */
  async saveRecommendations(recommendations: Recommendation[]): Promise<void> {
    try {
      for (const rec of recommendations) {
        await db.query(
          `INSERT INTO recommendations (
            id, target_id, target_type, category, priority,
            title, description, action_items, expected_impact,
            generated_by, reasoning, prompt, confidence, project_value,
            status, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            action_items = EXCLUDED.action_items,
            expected_impact = EXCLUDED.expected_impact,
            confidence = EXCLUDED.confidence,
            project_value = EXCLUDED.project_value`,
          [
            rec.id,
            rec.targetId,
            rec.targetType,
            rec.category,
            rec.priority,
            rec.title,
            rec.description,
            JSON.stringify(rec.actionItems),
            JSON.stringify(rec.expectedImpact),
            rec.generatedBy,
            rec.reasoning,
            rec.prompt,
            rec.confidence,
            rec.projectValue || null,
            rec.status,
            rec.createdAt,
          ]
        );
      }

      logger.info('Recommendations saved to database', {
        count: recommendations.length,
        targetId: recommendations[0]?.targetId,
      });
    } catch (error) {
      logger.error('Failed to save recommendations', { error });
      throw error;
    }
  }

  /**
   * Get recommendations by target (channel or video)
   */
  async getRecommendationsByTarget(
    targetId: string,
    targetType: 'channel' | 'video',
    limit: number = 50
  ): Promise<Recommendation[]> {
    try {
      const result = await db.query(
        `SELECT * FROM recommendations
         WHERE target_id = $1 AND target_type = $2
         ORDER BY created_at DESC
         LIMIT $3`,
        [targetId, targetType, limit]
      );

      return result.rows.map(this.mapRowToRecommendation);
    } catch (error) {
      logger.error('Failed to get recommendations', { error, targetId, targetType });
      throw error;
    }
  }

  /**
   * Get latest recommendations snapshot for a target
   */
  async getLatestSnapshot(
    targetId: string,
    targetType: 'channel' | 'video'
  ): Promise<{ recommendations: Recommendation[]; generatedAt: Date; algorithmScore?: any } | null> {
    try {
      // Get the most recent created_at timestamp
      const latestResult = await db.query(
        `SELECT created_at FROM recommendations
         WHERE target_id = $1 AND target_type = $2
         ORDER BY created_at DESC
         LIMIT 1`,
        [targetId, targetType]
      );

      if (latestResult.rows.length === 0) {
        return null;
      }

      const generatedAt = latestResult.rows[0].created_at;

      // Get all recommendations from that timestamp
      const recsResult = await db.query(
        `SELECT * FROM recommendations
         WHERE target_id = $1 AND target_type = $2 AND created_at = $3
         ORDER BY priority DESC, project_value DESC NULLS LAST`,
        [targetId, targetType, generatedAt]
      );

      // Get algorithm score for this snapshot (only for channels)
      let algorithmScore = null;
      if (targetType === 'channel') {
        const scoreResult = await db.query(
          `SELECT algorithm_score FROM channel_snapshots
           WHERE channel_id = $1 AND created_at = $2
           LIMIT 1`,
          [targetId, generatedAt]
        );

        if (scoreResult.rows.length > 0) {
          algorithmScore = typeof scoreResult.rows[0].algorithm_score === 'string'
            ? JSON.parse(scoreResult.rows[0].algorithm_score)
            : scoreResult.rows[0].algorithm_score;
        }
      }

      return {
        recommendations: recsResult.rows.map(this.mapRowToRecommendation),
        generatedAt,
        algorithmScore,
      };
    } catch (error) {
      logger.error('Failed to get latest snapshot', { error, targetId, targetType });
      throw error;
    }
  }

  /**
   * Update recommendation status
   */
  async updateStatus(
    id: string,
    status: 'pending' | 'in_progress' | 'implemented' | 'dismissed' | 'expired',
    notes?: string
  ): Promise<void> {
    try {
      await db.query(
        `UPDATE recommendations
         SET status = $1,
             implementation_notes = COALESCE($2, implementation_notes),
             implemented_at = CASE WHEN $1 = 'implemented' THEN NOW() ELSE implemented_at END
         WHERE id = $3`,
        [status, notes, id]
      );

      logger.info('Recommendation status updated', { id, status });
    } catch (error) {
      logger.error('Failed to update recommendation status', { error, id, status });
      throw error;
    }
  }

  /**
   * Add user feedback to recommendation
   */
  async addFeedback(
    id: string,
    rating?: number,
    feedback?: string,
    helpful?: boolean
  ): Promise<void> {
    try {
      await db.query(
        `UPDATE recommendations
         SET user_rating = COALESCE($1, user_rating),
             user_feedback = COALESCE($2, user_feedback),
             helpful = COALESCE($3, helpful)
         WHERE id = $4`,
        [rating, feedback, helpful, id]
      );

      logger.info('Recommendation feedback added', { id, rating, helpful });
    } catch (error) {
      logger.error('Failed to add recommendation feedback', { error, id });
      throw error;
    }
  }

  /**
   * Delete old recommendations for a target (keep only latest snapshot)
   */
  async cleanupOldRecommendations(
    targetId: string,
    targetType: 'channel' | 'video',
    keepLatest: number = 1
  ): Promise<void> {
    try {
      // Get the timestamps to keep
      const timestampsResult = await db.query(
        `SELECT DISTINCT created_at FROM recommendations
         WHERE target_id = $1 AND target_type = $2
         ORDER BY created_at DESC
         LIMIT $3`,
        [targetId, targetType, keepLatest]
      );

      if (timestampsResult.rows.length === 0) return;

      const timestampsToKeep = timestampsResult.rows.map(row => row.created_at);

      // Delete recommendations not in the keep list
      await db.query(
        `DELETE FROM recommendations
         WHERE target_id = $1 AND target_type = $2
         AND created_at NOT IN (SELECT unnest($3::timestamp[]))`,
        [targetId, targetType, timestampsToKeep]
      );

      logger.info('Old recommendations cleaned up', { targetId, targetType, kept: keepLatest });
    } catch (error) {
      logger.error('Failed to cleanup old recommendations', { error, targetId, targetType });
      throw error;
    }
  }

  /**
   * Get recommendation statistics for a target
   */
  async getStats(targetId: string, targetType: 'channel' | 'video'): Promise<{
    total: number;
    byPriority: Record<string, number>;
    byStatus: Record<string, number>;
    avgRating: number | null;
    lastGenerated: Date | null;
  }> {
    try {
      const statsResult = await db.query(
        `SELECT
          COUNT(*) as total,
          AVG(user_rating) as avg_rating,
          MAX(created_at) as last_generated
         FROM recommendations
         WHERE target_id = $1 AND target_type = $2`,
        [targetId, targetType]
      );

      const priorityResult = await db.query(
        `SELECT priority, COUNT(*) as count
         FROM recommendations
         WHERE target_id = $1 AND target_type = $2
         GROUP BY priority`,
        [targetId, targetType]
      );

      const statusResult = await db.query(
        `SELECT status, COUNT(*) as count
         FROM recommendations
         WHERE target_id = $1 AND target_type = $2
         GROUP BY status`,
        [targetId, targetType]
      );

      const byPriority: Record<string, number> = {};
      priorityResult.rows.forEach(row => {
        byPriority[row.priority] = parseInt(row.count);
      });

      const byStatus: Record<string, number> = {};
      statusResult.rows.forEach(row => {
        byStatus[row.status] = parseInt(row.count);
      });

      return {
        total: parseInt(statsResult.rows[0]?.total || 0),
        avgRating: statsResult.rows[0]?.avg_rating || null,
        lastGenerated: statsResult.rows[0]?.last_generated || null,
        byPriority,
        byStatus,
      };
    } catch (error) {
      logger.error('Failed to get recommendation stats', { error, targetId, targetType });
      throw error;
    }
  }

  /**
   * Map database row to Recommendation object
   */
  private mapRowToRecommendation(row: any): Recommendation {
    return {
      id: row.id,
      targetId: row.target_id,
      targetType: row.target_type,
      category: row.category,
      priority: row.priority,
      title: row.title,
      description: row.description,
      actionItems: typeof row.action_items === 'string'
        ? JSON.parse(row.action_items)
        : row.action_items,
      expectedImpact: typeof row.expected_impact === 'string'
        ? JSON.parse(row.expected_impact)
        : row.expected_impact,
      generatedBy: row.generated_by,
      reasoning: row.reasoning,
      prompt: row.prompt,
      confidence: parseFloat(row.confidence),
      projectValue: row.project_value ? parseInt(row.project_value) : undefined,
      status: row.status,
      implementedAt: row.implemented_at ? new Date(row.implemented_at) : undefined,
      implementationNotes: row.implementation_notes,
      actualImpact: row.actual_impact ? JSON.parse(row.actual_impact) : undefined,
      userRating: row.user_rating ? parseInt(row.user_rating) : undefined,
      userFeedback: row.user_feedback,
      helpful: row.helpful,
      createdAt: new Date(row.created_at),
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
    };
  }
}

export const recommendationsRepository = new RecommendationsRepository();
