/**
 * AI Service
 * Handles AI generation using Anthropic Claude and other models
 */

import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import logger, { logAIGeneration } from '../utils/logger';
import { AIModel } from '../types/models';

export interface AIGenerationOptions {
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AIGenerationResult {
  content: string;
  model: string;
  tokensUsed?: number;
  duration: number;
}

export class AIService {
  private anthropic: Anthropic;
  private static instance: AIService;

  private constructor() {
    this.anthropic = new Anthropic({
      apiKey: config.ai.anthropic.apiKey,
    });
    logger.info('AI service initialized');
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Generate content using Claude
   */
  public async generateWithClaude(
    prompt: string,
    options: AIGenerationOptions = {}
  ): Promise<AIGenerationResult> {
    const startTime = Date.now();

    try {
      const model = options.model || config.ai.anthropic.model;
      const temperature = options.temperature ?? config.ai.anthropic.temperatureAnalytical;
      const maxTokens = options.maxTokens || config.ai.anthropic.maxTokens;

      const messages: Anthropic.MessageParam[] = [
        {
          role: 'user',
          content: prompt,
        },
      ];

      const response = await this.anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: options.systemPrompt,
        messages,
      });

      const duration = Date.now() - startTime;
      const content = this.extractTextContent(response.content);

      const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

      logAIGeneration(model, 'recommendation', tokensUsed, duration);

      logger.info('Claude generation completed', {
        model,
        tokensUsed,
        duration,
        promptLength: prompt.length,
        responseLength: content.length,
      });

      return {
        content,
        model,
        tokensUsed,
        duration,
      };
    } catch (error) {
      logger.error('Claude generation failed', { error, prompt: prompt.substring(0, 100) });
      throw error;
    }
  }

  /**
   * Generate content with retry logic
   */
  public async generateWithRetry(
    prompt: string,
    options: AIGenerationOptions = {},
    maxRetries: number = 3
  ): Promise<AIGenerationResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.generateWithClaude(prompt, options);
      } catch (error) {
        lastError = error as Error;
        logger.warn(`AI generation attempt ${attempt} failed`, {
          attempt,
          maxRetries,
          error: (error as Error).message,
        });

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await this.delay(delay);
        }
      }
    }

    throw new Error(
      `AI generation failed after ${maxRetries} attempts: ${lastError?.message}`
    );
  }

  /**
   * Stream generation (for future real-time features)
   */
  public async streamGeneration(
    prompt: string,
    options: AIGenerationOptions = {},
    onChunk: (chunk: string) => void
  ): Promise<AIGenerationResult> {
    const startTime = Date.now();

    try {
      const model = options.model || config.ai.anthropic.model;
      const temperature = options.temperature ?? config.ai.anthropic.temperatureAnalytical;
      const maxTokens = options.maxTokens || config.ai.anthropic.maxTokens;

      const stream = await this.anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: options.systemPrompt,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      });

      let fullContent = '';

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const chunk = event.delta.text;
          fullContent += chunk;
          onChunk(chunk);
        }
      }

      const duration = Date.now() - startTime;

      return {
        content: fullContent,
        model,
        duration,
      };
    } catch (error) {
      logger.error('Streaming generation failed', { error });
      throw error;
    }
  }

  /**
   * Validate AI response
   */
  public validateResponse(content: string, minLength: number = 100): boolean {
    // Check if response is not empty
    if (!content || content.trim().length === 0) {
      logger.warn('AI response is empty');
      return false;
    }

    // Check minimum length
    if (content.length < minLength) {
      logger.warn('AI response too short', { length: content.length, minLength });
      return false;
    }

    // Check for common error patterns
    const errorPatterns = [
      /I cannot/i,
      /I'm unable to/i,
      /I don't have access/i,
      /API error/i,
    ];

    for (const pattern of errorPatterns) {
      if (pattern.test(content)) {
        logger.warn('AI response contains error pattern', { pattern: pattern.source });
        return false;
      }
    }

    return true;
  }

  /**
   * Extract text content from Claude response
   */
  private extractTextContent(
    content: Anthropic.ContentBlock | Anthropic.ContentBlock[]
  ): string {
    if (Array.isArray(content)) {
      return content
        .map((block) => (block.type === 'text' ? block.text : ''))
        .join('');
    }

    return content.type === 'text' ? content.text : '';
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Estimate token count (rough approximation)
   */
  public estimateTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if prompt is within token limits
   */
  public isWithinTokenLimit(prompt: string, maxTokens: number = 4000): boolean {
    const estimatedTokens = this.estimateTokens(prompt);
    return estimatedTokens < maxTokens * 0.8; // Leave 20% for response
  }

  /**
   * Truncate prompt if too long
   */
  public truncatePrompt(prompt: string, maxTokens: number = 4000): string {
    const maxChars = maxTokens * 4 * 0.8; // Conservative estimate

    if (prompt.length <= maxChars) {
      return prompt;
    }

    logger.warn('Prompt truncated due to length', {
      originalLength: prompt.length,
      truncatedLength: maxChars,
    });

    return prompt.substring(0, maxChars) + '\n\n[Content truncated due to length]';
  }
}

export const aiService = AIService.getInstance();
export default aiService;
