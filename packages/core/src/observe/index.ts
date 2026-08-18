// ============================================================================
// Observability Engine Module
// Built-in monitoring, analytics, and feedback loops
// ============================================================================

import { nanoid } from 'nanoid';
import type {
  ObservabilityConfig,
  PerformanceObservability,
  AnalyticsConfig,
  LoggingConfig,
  FeedbackConfig,
  AlertConfig,
  ID,
} from '../types/index.js';

// ─── Observability Engine ───────────────────────────────────────────────────

export class ObservabilityEngine {
  private config: ObservabilityConfig;
  private metrics: Map<string, Metric[]>;
  private logs: LogEntry[];
  private alerts: Alert[];
  private feedbackEntries: FeedbackEntry[];

  constructor(config?: ObservabilityConfig) {
    this.config = config ?? this.createDefaultConfig();
    this.metrics = new Map();
    this.logs = [];
    this.alerts = [];
    this.feedbackEntries = [];
  }

  /**
   * Get current config
   */
  getConfig(): ObservabilityConfig {
    return this.config;
  }

  /**
   * Update config
   */
  updateConfig(updates: Partial<ObservabilityConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // ─── Performance Monitoring ────────────────────────────────────────────

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    this.metrics.get(name)!.push({
      name,
      value,
      timestamp: new Date().toISOString(),
      tags: tags ?? {},
    });

    // Check for alert conditions
    this.checkAlertConditions(name, value);
  }

  /**
   * Record Core Web Vitals
   */
  recordWebVitals(vitals: WebVitals): void {
    this.recordMetric('LCP', vitals.lcp, { unit: 'ms' });
    this.recordMetric('FID', vitals.fid, { unit: 'ms' });
    this.recordMetric('CLS', vitals.cls, { unit: 'unitless' });
    this.recordMetric('TTFB', vitals.ttfb, { unit: 'ms' });
    this.recordMetric('FCP', vitals.fcp, { unit: 'ms' });
  }

  /**
   * Get metric statistics
   */
  getMetricStats(name: string, timeRange?: TimeRange): MetricStats | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return null;

    let filtered = metrics;
    if (timeRange) {
      filtered = metrics.filter(m => {
        const time = new Date(m.timestamp).getTime();
        return time >= new Date(timeRange.start).getTime() && time <= new Date(timeRange.end).getTime();
      });
    }

    if (filtered.length === 0) return null;

    const values = filtered.map(m => m.value);
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      min: sorted[0]!,
      max: sorted[sorted.length - 1]!,
      mean: sum / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)]!,
      p95: sorted[Math.floor(sorted.length * 0.95)]!,
      p99: sorted[Math.floor(sorted.length * 0.99)]!,
    };
  }

  /**
   * Get all metric names
   */
  getMetricNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  // ─── Analytics ─────────────────────────────────────────────────────────

  /**
   * Track an event
   */
  trackEvent(event: string, properties?: Record<string, unknown>): void {
    if (!this.config.analytics.trackEvents) return;

    this.logs.push({
      id: nanoid(),
      level: 'info',
      message: `Event: ${event}`,
      timestamp: new Date().toISOString(),
      data: { event, properties },
      source: 'analytics',
    });
  }

  /**
   * Track a page view
   */
  trackPageView(path: string, title?: string): void {
    this.trackEvent('page_view', { path, title });
  }

  /**
   * Track an error
   */
  trackError(error: Error, context?: Record<string, unknown>): void {
    if (!this.config.analytics.trackErrors) return;

    this.logs.push({
      id: nanoid(),
      level: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
      data: { error: error.stack, context },
      source: 'error-tracker',
    });
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(timeRange?: TimeRange): AnalyticsSummary {
    const logs = this.getLogsInRange(timeRange);
    const events = logs.filter(l => l.data && l.data.event);

    const pageViews = events.filter(l => l.data?.event === 'page_view').length;
    const errors = logs.filter(l => l.level === 'error').length;
    const uniqueEvents = new Set(events.map(l => l.data?.event as string));

    return {
      totalEvents: events.length,
      pageViews,
      errors,
      uniqueEvents: uniqueEvents.size,
      eventTypes: Array.from(uniqueEvents),
    };
  }

  // ─── Logging ───────────────────────────────────────────────────────────

  /**
   * Log a message
   */
  log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    const entry: LogEntry = {
      id: nanoid(),
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      source: 'application',
    };

    this.logs.push(entry);

    // Trim logs if too many
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(-5000);
    }

    // Check for alert conditions on error logs
    if (level === 'error') {
      this.checkLogAlert(entry);
    }
  }

  /**
   * Get logs with optional filtering
   */
  getLogs(filter?: LogFilter): LogEntry[] {
    let filtered = [...this.logs];

    if (filter?.level) {
      filtered = filtered.filter(l => l.level === filter.level);
    }
    if (filter?.source) {
      filtered = filtered.filter(l => l.source === filter.source);
    }
    if (filter?.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(l => l.message.toLowerCase().includes(search));
    }
    if (filter?.timeRange) {
      filtered = filtered.filter(l => {
        const time = new Date(l.timestamp).getTime();
        return time >= new Date(filter.timeRange!.start).getTime() &&
               time <= new Date(filter.timeRange!.end).getTime();
      });
    }

    // Apply limit
    const limit = filter?.limit ?? 100;
    return filtered.slice(-limit);
  }

  /**
   * Get logs in time range
   */
  private getLogsInRange(timeRange?: TimeRange): LogEntry[] {
    if (!timeRange) return this.logs;
    return this.logs.filter(l => {
      const time = new Date(l.timestamp).getTime();
      return time >= new Date(timeRange.start).getTime() && time <= new Date(timeRange.end).getTime();
    });
  }

  // ─── Alerts ────────────────────────────────────────────────────────────

  /**
   * Create an alert
   */
  createAlert(alert: Omit<Alert, 'id' | 'createdAt' | 'triggeredAt'>): Alert {
    const newAlert: Alert = {
      ...alert,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };
    this.alerts.push(newAlert);
    return newAlert;
  }

  /**
   * Get all alerts
   */
  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  /**
   * Get active (triggered) alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => a.triggeredAt && !a.resolvedAt);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: ID): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;
    alert.resolvedAt = new Date().toISOString();
    return true;
  }

  /**
   * Check alert conditions when a metric is recorded
   */
  private checkAlertConditions(metricName: string, value: number): void {
    for (const alert of this.alerts) {
      if (alert.trigger.type === 'metric' && alert.trigger.metric === metricName) {
        let triggered = false;
        switch (alert.trigger.operator) {
          case '>': triggered = value > alert.trigger.threshold!; break;
          case '<': triggered = value < alert.trigger.threshold!; break;
          case '>=': triggered = value >= alert.trigger.threshold!; break;
          case '<=': triggered = value <= alert.trigger.threshold!; break;
          case '==': triggered = value === alert.trigger.threshold!; break;
        }
        if (triggered && !alert.triggeredAt) {
          alert.triggeredAt = new Date().toISOString();
          this.fireAlert(alert, { metric: metricName, value });
        }
      }
    }
  }

  /**
   * Check log-based alert conditions
   */
  private checkLogAlert(entry: LogEntry): void {
    for (const alert of this.alerts) {
      if (alert.trigger.type === 'log' && alert.trigger.level === entry.level) {
        if (!alert.triggeredAt || new Date(alert.triggeredAt).getTime() < Date.now() - 60000) {
          alert.triggeredAt = new Date().toISOString();
          this.fireAlert(alert, { log: entry });
        }
      }
    }
  }

  /**
   * Fire an alert notification
   */
  private fireAlert(alert: Alert, context: Record<string, unknown>): void {
    for (const channel of alert.channels) {
      switch (channel.type) {
        case 'email':
          this.sendEmailAlert(alert, channel.target, context);
          break;
        case 'slack':
          this.sendSlackAlert(alert, channel.target, context);
          break;
        case 'webhook':
          this.sendWebhookAlert(alert, channel.target, context);
          break;
      }
    }
  }

  private sendEmailAlert(alert: Alert, target: string, context: Record<string, unknown>): void {
    // Implementation would send actual email
    this.log('info', `Alert email sent to ${target}`, { alert: alert.id, context });
  }

  private sendSlackAlert(alert: Alert, target: string, context: Record<string, unknown>): void {
    // Implementation would send Slack message
    this.log('info', `Alert Slack message sent to ${target}`, { alert: alert.id, context });
  }

  private sendWebhookAlert(alert: Alert, target: string, context: Record<string, unknown>): void {
    // Implementation would POST to webhook URL
    this.log('info', `Alert webhook sent to ${target}`, { alert: alert.id, context });
  }

  // ─── Feedback ──────────────────────────────────────────────────────────

  /**
   * Submit user feedback
   */
  submitFeedback(feedback: Omit<FeedbackEntry, 'id' | 'createdAt'>): FeedbackEntry {
    const entry: FeedbackEntry = {
      ...feedback,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };
    this.feedbackEntries.push(entry);
    return entry;
  }

  /**
   * Get all feedback
   */
  getFeedback(): FeedbackEntry[] {
    return [...this.feedbackEntries];
  }

  /**
   * Get feedback summary
   */
  getFeedbackSummary(): FeedbackSummary {
    const total = this.feedbackEntries.length;
    if (total === 0) {
      return { total: 0, averageRating: 0, byCategory: {}, byRating: {} };
    }

    const sum = this.feedbackEntries.reduce((acc, f) => acc + f.rating, 0);
    const byCategory: Record<string, number> = {};
    const byRating: Record<number, number> = {};

    for (const entry of this.feedbackEntries) {
      byCategory[entry.category] = (byCategory[entry.category] ?? 0) + 1;
      byRating[entry.rating] = (byRating[entry.rating] ?? 0) + 1;
    }

    return {
      total,
      averageRating: sum / total,
      byCategory,
      byRating,
    };
  }

  // ─── Reports ───────────────────────────────────────────────────────────

  /**
   * Generate a performance report
   */
  generateReport(timeRange?: TimeRange): ObservabilityReport {
    const vitals = ['LCP', 'FID', 'CLS', 'TTFB', 'FCP'];
    const webVitals: Record<string, MetricStats | null> = {};

    for (const vital of vitals) {
      webVitals[vital] = this.getMetricStats(vital, timeRange);
    }

    return {
      generatedAt: new Date().toISOString(),
      timeRange: timeRange ?? { start: new Date(Date.now() - 86400000).toISOString(), end: new Date().toISOString() },
      webVitals,
      analytics: this.getAnalyticsSummary(timeRange),
      feedback: this.getFeedbackSummary(),
      activeAlerts: this.getActiveAlerts().length,
    };
  }

  // ─── Private Helpers ──────────────────────────────────────────────────

  /**
   * Create default observability config
   */
  private createDefaultConfig(): ObservabilityConfig {
    return {
      performance: {
        coreWebVitals: true,
        realUserMetrics: true,
        syntheticMonitoring: false,
      },
      analytics: {
        privacy: 'minimal',
        trackEvents: true,
        trackErrors: true,
        trackUsage: false,
      },
      logging: {
        level: 'info',
        destination: ['console'],
        retention: '7d',
      },
      alerts: [],
      feedback: {
        enabled: true,
        prompt: 'How was your experience?',
        categories: ['ui', 'performance', 'bug', 'feature'],
      },
    };
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Metric {
  name: string;
  value: number;
  timestamp: string;
  tags: Record<string, string>;
}

export interface MetricStats {
  count: number;
  min: number;
  max: number;
  mean: number;
  p50: number;
  p95: number;
  p99: number;
}

export interface LogEntry {
  id: ID;
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
  source: string;
}

export interface LogFilter {
  level?: LogLevel;
  source?: string;
  search?: string;
  timeRange?: TimeRange;
  limit?: number;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface Alert {
  id: ID;
  name: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  trigger: AlertTrigger;
  channels: AlertChannel[];
  createdAt: string;
  triggeredAt?: string;
  resolvedAt?: string;
}

export interface AlertTrigger {
  type: 'metric' | 'log' | 'condition';
  metric?: string;
  operator?: '>' | '<' | '>=' | '<=' | '==';
  threshold?: number;
  level?: LogLevel;
  condition?: string;
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  target: string;
}

export interface FeedbackEntry {
  id: ID;
  userId?: string;
  rating: number;
  comment?: string;
  category: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface WebVitals {
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  fcp: number;
}

export interface AnalyticsSummary {
  totalEvents: number;
  pageViews: number;
  errors: number;
  uniqueEvents: number;
  eventTypes: string[];
}

export interface FeedbackSummary {
  total: number;
  averageRating: number;
  byCategory: Record<string, number>;
  byRating: Record<number, number>;
}

export interface ObservabilityReport {
  generatedAt: string;
  timeRange: TimeRange;
  webVitals: Record<string, MetricStats | null>;
  analytics: AnalyticsSummary;
  feedback: FeedbackSummary;
  activeAlerts: number;
}

// ─── Utility Functions ──────────────────────────────────────────────────────

export function createObservabilityEngine(config?: ObservabilityConfig): ObservabilityEngine {
  return new ObservabilityEngine(config);
}

export default ObservabilityEngine;
