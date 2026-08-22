// ============================================================================
// Memory System — Context persistence and retrieval for agents
// ============================================================================

import {
  MemoryEntry,
  MemoryQuery,
  MemoryConfig,
} from './types.js';
import { nanoid } from 'nanoid';

export const DEFAULT_MEMORY_CONFIG: MemoryConfig = {
  maxEntries: 1000,
  autoSummarize: true,
  summarizationThreshold: 100,
  persistencePath: undefined,
};

export class MemorySystem {
  private entries: Map<string, MemoryEntry> = new Map();
  private config: MemoryConfig;

  constructor(config: MemoryConfig = {}) {
    this.config = { ...DEFAULT_MEMORY_CONFIG, ...config };
  }

  // ---------- CRUD Operations ----------

  async add(entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryEntry> {
    const now = new Date().toISOString();
    const fullEntry: MemoryEntry = {
      ...entry,
      id: `mem_${nanoid(12)}`,
      createdAt: now,
      updatedAt: now,
    };

    this.entries.set(fullEntry.id, fullEntry);
    this.enforceMaxEntries();

    if (this.config.autoSummarize) {
      await this.maybeSummarize();
    }

    return fullEntry;
  }

  async get(id: string): Promise<MemoryEntry | undefined> {
    return this.entries.get(id);
  }

  async update(id: string, updates: Partial<Omit<MemoryEntry, 'id' | 'createdAt'>>): Promise<MemoryEntry | undefined> {
    const entry = this.entries.get(id);
    if (!entry) return undefined;

    const updated: MemoryEntry = {
      ...entry,
      ...updates,
      id: entry.id,
      createdAt: entry.createdAt,
      updatedAt: new Date().toISOString(),
    };

    this.entries.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.entries.delete(id);
  }

  async clear(): Promise<void> {
    this.entries.clear();
  }

  // ---------- Search & Retrieval ----------

  async search(query: MemoryQuery): Promise<MemoryEntry[]> {
    let results = Array.from(this.entries.values());

    // Filter by type
    if (query.type) {
      results = results.filter((e) => e.type === query.type);
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      results = results.filter((e) =>
        query.tags!.some((tag) => e.tags.includes(tag))
      );
    }

    // Filter by creation date
    if (query.since) {
      results = results.filter((e) => e.createdAt >= query.since!);
    }

    // Filter expired entries (TTL)
    results = results.filter((e) => {
      if (!e.ttl) return true;
      const created = new Date(e.createdAt).getTime();
      return Date.now() - created < e.ttl * 1000;
    });

    // Text search with simple relevance scoring
    if (query.text) {
      const searchTerms = query.text.toLowerCase().split(/\s+/);
      results = results
        .map((entry) => ({
          entry,
          score: this.calculateRelevance(entry, searchTerms),
        }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.entry);
    } else {
      // Sort by importance and recency
      results.sort((a, b) => {
        const scoreDiff = b.importance - a.importance;
        if (scoreDiff !== 0) return scoreDiff;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    }

    // Apply limit
    const limit = query.limit ?? 10;
    return results.slice(0, limit);
  }

  // ---------- Summarization ----------

  async summarize(type?: MemoryEntry['type']): Promise<string> {
    const entries = await this.search({ type, limit: this.config.summarizationThreshold });
    if (entries.length === 0) return '';

    const grouped = new Map<string, MemoryEntry[]>();
    for (const entry of entries) {
      const existing = grouped.get(entry.type) ?? [];
      existing.push(entry);
      grouped.set(entry.type, existing);
    }

    const summaries: string[] = [];
    for (const [entryType, items] of grouped) {
      const topItems = items
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 5);
      summaries.push(
        `[${entryType}] ${topItems.map((i) => i.content).join('; ')}`
      );
    }

    return summaries.join('\n');
  }

  async maybeSummarize(): Promise<void> {
    const count = this.entries.size;
    if (count >= this.config.summarizationThreshold!) {
      const summary = await this.summarize();
      if (summary) {
        await this.add({
          content: summary,
          type: 'summary',
          importance: 0.9,
          tags: ['auto-summary'],
        });
      }
    }
  }

  // ---------- Context Injection ----------

  async getContextForMessage(message: string, maxEntries: number = 5): Promise<string> {
    const relevant = await this.search({ text: message, limit: maxEntries });
    if (relevant.length === 0) return '';

    return relevant
      .map((m) => `[${m.type}] ${m.content}`)
      .join('\n');
  }

  // ---------- Persistence ----------

  async exportToJSON(): Promise<string> {
    const data = {
      entries: Array.from(this.entries.values()),
      config: this.config,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  async importFromJSON(json: string): Promise<number> {
    const data = JSON.parse(json);
    if (!data.entries || !Array.isArray(data.entries)) {
      throw new Error('Invalid memory export format');
    }

    let count = 0;
    for (const entry of data.entries) {
      if (entry.id && entry.content && entry.type) {
        this.entries.set(entry.id, entry as MemoryEntry);
        count++;
      }
    }

    return count;
  }

  // ---------- Helpers ----------

  private calculateRelevance(entry: MemoryEntry, searchTerms: string[]): number {
    const content = entry.content.toLowerCase();
    let score = 0;

    for (const term of searchTerms) {
      if (content.includes(term)) {
        score += 1;
        // Bonus for exact phrase matches
        if (content.includes(term)) {
          score += entry.importance * 0.5;
        }
      }
    }

    // Tag matching bonus
    for (const tag of entry.tags) {
      for (const term of searchTerms) {
        if (tag.toLowerCase().includes(term)) {
          score += 0.5;
        }
      }
    }

    return score;
  }

  private enforceMaxEntries(): void {
    const max = this.config.maxEntries ?? 1000;
    if (this.entries.size <= max) return;

    // Remove oldest, lowest importance entries
    const sorted = Array.from(this.entries.values()).sort((a, b) => {
      const importanceDiff = a.importance - b.importance;
      if (importanceDiff !== 0) return importanceDiff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const toRemove = sorted.slice(0, this.entries.size - max);
    for (const entry of toRemove) {
      this.entries.delete(entry.id);
    }
  }

  // ---------- Stats ----------

  getStats(): {
    totalEntries: number;
    byType: Record<string, number>;
    byTag: Record<string, number>;
    avgImportance: number;
  } {
    const entries = Array.from(this.entries.values());
    const byType: Record<string, number> = {};
    const byTag: Record<string, number> = {};
    let totalImportance = 0;

    for (const entry of entries) {
      byType[entry.type] = (byType[entry.type] ?? 0) + 1;
      totalImportance += entry.importance;
      for (const tag of entry.tags) {
        byTag[tag] = (byTag[tag] ?? 0) + 1;
      }
    }

    return {
      totalEntries: entries.length,
      byType,
      byTag,
      avgImportance: entries.length > 0 ? totalImportance / entries.length : 0,
    };
  }
}

export default MemorySystem;