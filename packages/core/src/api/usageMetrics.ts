// Usage Metrics Tracking Module
// Tracks API usage statistics, costs, and generates reports

import { ApiProvider, UsageMetrics, UsageReport, ApiKeyMetadata } from './types.js';

/**
 * Usage event recorded for each API call
 */
export interface UsageEvent {
  keyId: string;
  provider: ApiProvider;
  timestamp: Date;
  requestType: string;
  tokensUsed: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  responseTime: number;
  success: boolean;
  errorMessage?: string;
  model?: string;
}

/**
 * Daily usage aggregation
 */
export interface DailyUsage {
  date: string;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  errors: number;
}

/**
 * Usage metrics tracker
 */
export class UsageMetricsTracker {
  private events: UsageEvent[] = [];
  private keyMetrics: Map<string, UsageMetrics> = new Map();
  private dailyStats: Map<string, DailyUsage> = new Map();
  private maxEvents: number = 10000;

  /**
   * Record a usage event
   */
  recordEvent(event: UsageEvent): void {
    this.events.push(event);
    this.updateKeyMetrics(event);
    this.updateDailyStats(event);

    // Trim events if exceeding max
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  /**
   * Update per-key metrics from an event
   */
  private updateKeyMetrics(event: UsageEvent): void {
    const existing = this.keyMetrics.get(event.keyId) || this.createEmptyMetrics();
    
    const updated: UsageMetrics = {
      ...existing,
      totalRequests: existing.totalRequests + 1,
      totalTokens: existing.totalTokens + event.tokensUsed,
      totalCost: existing.totalCost + event.cost,
      lastUsed: event.timestamp,
      firstUsed: existing.firstUsed || event.timestamp,
      dailyRequests: this.getTodayRequests(existing, event.timestamp) + 1,
      monthlyRequests: this.getMonthRequests(existing, event.timestamp) + 1,
      averageResponseTime: this.calculateNewAverage(
        existing.averageResponseTime,
        existing.totalRequests,
        event.responseTime
      ),
      errorRate: event.success
        ? existing.errorRate
        : ((existing.errorRate * existing.totalRequests + 1) / (existing.totalRequests + 1)),
      lastError: event.success ? existing.lastError : event.errorMessage,
    };

    this.keyMetrics.set(event.keyId, updated);
  }

  /**
   * Create empty metrics object
   */
  private createEmptyMetrics(): UsageMetrics {
    return {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      dailyRequests: 0,
      monthlyRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
    };
  }

  /**
   * Get today's request count
   */
  private getTodayRequests(metrics: UsageMetrics, now: Date): number {
    if (!metrics.lastUsed) return 0;
    const lastDate = new Date(metrics.lastUsed).toDateString();
    const nowDate = now.toDateString();
    return lastDate === nowDate ? metrics.dailyRequests : 0;
  }

  /**
   * Get this month's request count
   */
  private getMonthRequests(metrics: UsageMetrics, now: Date): number {
    if (!metrics.lastUsed) return 0;
    const lastDate = new Date(metrics.lastUsed);
    const isSameMonth = lastDate.getMonth() === now.getMonth() && lastDate.getFullYear() === now.getFullYear();
    return isSameMonth ? metrics.monthlyRequests : 0;
  }

  /**
   * Calculate new rolling average
   */
  private calculateNewAverage(currentAvg: number, count: number, newValue: number): number {
    return (currentAvg * count + newValue) / (count + 1);
  }

  /**
   * Update daily statistics
   */
  private updateDailyStats(event: UsageEvent): void {
    const dateKey = event.timestamp.toISOString().split('T')[0];
    const existing = this.dailyStats.get(dateKey) || {
      date: dateKey,
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      errors: 0,
    };

    existing.totalRequests += 1;
    existing.totalTokens += event.tokensUsed;
    existing.totalCost += event.cost;
    if (!event.success) existing.errors += 1;

    this.dailyStats.set(dateKey, existing);
  }

  /**
   * Get metrics for a specific key
   */
  getKeyMetrics(keyId: string): UsageMetrics | undefined {
    return this.keyMetrics.get(keyId);
  }

  /**
   * Get all tracked metrics
   */
  getAllMetrics(): Map<string, UsageMetrics> {
    return new Map(this.keyMetrics);
  }

  /**
   * Get daily usage for the last N days
   */
  getRecentDailyUsage(days: number): DailyUsage[] {
    const result: DailyUsage[] = [];
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      result.push(this.dailyStats.get(dateKey) || {
        date: dateKey,
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        errors: 0,
      });
    }

    return result.reverse();
  }

  /**
   * Generate a comprehensive usage report
   */
  generateReport(
    keys: ApiKeyMetadata[],
    period?: { start: Date; end: Date }
  ): UsageReport {
    const now = new Date();
    const start = period?.start || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = period?.end || now;

    const byProvider: Record<string, { keyCount: number; requests: number; tokens: number; cost: number }> = {};

    let totalRequests = 0;
    let totalTokens = 0;
    let totalCost = 0;

    for (const key of keys) {
      const metrics = this.keyMetrics.get(key.metadata.id);
      if (!metrics) {
        // Ensure provider exists in byProvider even with no usage
        const p = key.metadata.provider;
        if (!byProvider[p]) {
          byProvider[p] = { keyCount: 0, requests: 0, tokens: 0, cost: 0 };
        }
        byProvider[p].keyCount += 1;
        continue;
      }

      const p = key.metadata.provider;
      if (!byProvider[p]) {
        byProvider[p] = { keyCount: 0, requests: 0, tokens: 0, cost: 0 };
      }
      byProvider[p].keyCount += 1;
      byProvider[p].requests += metrics.totalRequests;
      byProvider[p].tokens += metrics.totalTokens;
      byProvider[p].cost += metrics.totalCost;

      totalRequests += metrics.totalRequests;
      totalTokens += metrics.totalTokens;
      totalCost += metrics.totalCost;
    }

    return {
      totalKeys: keys.length,
      activeKeys: keys.filter((k) => k.metadata.status === 'active').length,
      totalRequests,
      totalTokens,
      totalCost,
      byProvider: byProvider as Record<ApiProvider, { keyCount: number; requests: number; tokens: number; cost: number }>,
      period: { start, end },
    };
  }

  /**
   * Get the most used keys
   */
  getTopKeys(limit: number = 10): Array<{ keyId: string; metrics: UsageMetrics }> {
    const entries = Array.from(this.keyMetrics.entries())
      .map(([keyId, metrics]) => ({ keyId, metrics }))
      .sort((a, b) => b.metrics.totalRequests - a.metrics.totalRequests)
      .slice(0, limit);
    return entries;
  }

  /**
   * Get events for a specific key
   */
  getKeyEvents(keyId: string): UsageEvent[] {
    return this.events.filter((e) => e.keyId === keyId);
  }

  /**
   * Get recent events across all keys
   */
  getRecentEvents(limit: number = 100): UsageEvent[] {
    return this.events.slice(-limit).reverse();
  }

  /**
   * Reset metrics for a specific key
   */
  resetKeyMetrics(keyId: string): void {
    this.keyMetrics.delete(keyId);
    this.events = this.events.filter((e) => e.keyId !== keyId);
  }

  /**
   * Clear all metrics data
   */
  clearAll(): void {
    this.events = [];
    this.keyMetrics.clear();
    this.dailyStats.clear();
  }

  /**
   * Export metrics data
   */
  exportMetrics(): { events: UsageEvent[]; keyMetrics: [string, UsageMetrics][]; dailyStats: [string, DailyUsage][] } {
    return {
      events: [...this.events],
      keyMetrics: Array.from(this.keyMetrics.entries()),
      dailyStats: Array.from(this.dailyStats.entries()),
    };
  }

  /**
   * Import metrics data
   */
  importMetrics(data: { events: UsageEvent[]; keyMetrics: [string, UsageMetrics][]; dailyStats: [string, DailyUsage][] }): void {
    this.events = data.events || [];
    this.keyMetrics = new Map(data.keyMetrics || []);
    this.dailyStats = new Map(data.dailyStats || []);
  }

  /**
   * Calculate estimated monthly cost based on current usage
   */
  estimateMonthlyCost(): number {
    const last30Days = this.getRecentDailyUsage(30);
    return last30Days.reduce((sum, day) => sum + day.totalCost, 0);
  }

  /**
   * Get cost by provider
   */
  getCostByProvider(): Map<ApiProvider, number> {
    const costs = new Map<ApiProvider, number>();
    
    for (const event of this.events) {
      const current = costs.get(event.provider) || 0;
      costs.set(event.provider, current + event.cost);
    }

    return costs;
  }
}

/**
 * Create a default usage metrics tracker
 */
export function createMetricsTracker(): UsageMetricsTracker {
  return new UsageMetricsTracker();
}