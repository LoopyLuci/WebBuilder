import type { ObservabilityConfig, ID } from '../types/index.js';
export declare class ObservabilityEngine {
    private config;
    private metrics;
    private logs;
    private alerts;
    private feedbackEntries;
    constructor(config?: ObservabilityConfig);
    /**
     * Get current config
     */
    getConfig(): ObservabilityConfig;
    /**
     * Update config
     */
    updateConfig(updates: Partial<ObservabilityConfig>): void;
    /**
     * Record a performance metric
     */
    recordMetric(name: string, value: number, tags?: Record<string, string>): void;
    /**
     * Record Core Web Vitals
     */
    recordWebVitals(vitals: WebVitals): void;
    /**
     * Get metric statistics
     */
    getMetricStats(name: string, timeRange?: TimeRange): MetricStats | null;
    /**
     * Get all metric names
     */
    getMetricNames(): string[];
    /**
     * Track an event
     */
    trackEvent(event: string, properties?: Record<string, unknown>): void;
    /**
     * Track a page view
     */
    trackPageView(path: string, title?: string): void;
    /**
     * Track an error
     */
    trackError(error: Error, context?: Record<string, unknown>): void;
    /**
     * Get analytics summary
     */
    getAnalyticsSummary(timeRange?: TimeRange): AnalyticsSummary;
    /**
     * Log a message
     */
    log(level: LogLevel, message: string, data?: Record<string, unknown>): void;
    /**
     * Get logs with optional filtering
     */
    getLogs(filter?: LogFilter): LogEntry[];
    /**
     * Get logs in time range
     */
    private getLogsInRange;
    /**
     * Create an alert
     */
    createAlert(alert: Omit<Alert, 'id' | 'createdAt' | 'triggeredAt'>): Alert;
    /**
     * Get all alerts
     */
    getAlerts(): Alert[];
    /**
     * Get active (triggered) alerts
     */
    getActiveAlerts(): Alert[];
    /**
     * Resolve an alert
     */
    resolveAlert(alertId: ID): boolean;
    /**
     * Check alert conditions when a metric is recorded
     */
    private checkAlertConditions;
    /**
     * Check log-based alert conditions
     */
    private checkLogAlert;
    /**
     * Fire an alert notification
     */
    private fireAlert;
    private sendEmailAlert;
    private sendSlackAlert;
    private sendWebhookAlert;
    /**
     * Submit user feedback
     */
    submitFeedback(feedback: Omit<FeedbackEntry, 'id' | 'createdAt'>): FeedbackEntry;
    /**
     * Get all feedback
     */
    getFeedback(): FeedbackEntry[];
    /**
     * Get feedback summary
     */
    getFeedbackSummary(): FeedbackSummary;
    /**
     * Generate a performance report
     */
    generateReport(timeRange?: TimeRange): ObservabilityReport;
    /**
     * Create default observability config
     */
    private createDefaultConfig;
}
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
export declare function createObservabilityEngine(config?: ObservabilityConfig): ObservabilityEngine;
export default ObservabilityEngine;
//# sourceMappingURL=index.d.ts.map