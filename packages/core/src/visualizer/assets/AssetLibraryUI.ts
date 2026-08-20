// ============================================================================
// Asset Library Browser - UI Component (React/JSX compatible)
// Visual grid with categories, search, preview, and one-click insert
// ============================================================================

import type { Asset, AssetCategory, AssetInsertEvent } from './types.js';
import { AssetLibraryBrowser } from './AssetLibraryBrowser.js';
import { ASSET_CATEGORIES } from './AssetCategories.js';

// === HTML/Template Generation for Preview Pane ===

export function renderAssetGrid(
  assets: Asset[],
  options: { columns?: number; showLabels?: boolean } = {}
): string {
  const columns = options.columns ?? 4;
  const showLabels = options.showLabels ?? true;

  const items = assets
    .map((asset) => {
      const label = showLabels
        ? `<div class="asset-label" title="${asset.name}">${truncate(asset.name, 12)}</div>`
        : '';
      return `
        <div class="asset-grid-item" data-asset-id="${asset.id}" data-category="${asset.category}" title="${asset.name}">
          <div class="asset-thumbnail">${asset.thumbnail}</div>
          ${label}
          <button class="asset-insert-btn" data-asset-id="${asset.id}" title="Insert ${asset.name}">+</button>
        </div>
      `;
    })
    .join('');

  return `
    <div class="asset-grid" style="display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 8px;">
      ${items}
    </div>
  `;
}

export function renderCategoryTabs(
  activeCategory: AssetCategory | 'all',
  counts: Record<string, number>
): string {
  const tabs = ASSET_CATEGORIES.map((cat) => {
    const isActive = activeCategory === cat.id ? ' active' : '';
    const count = counts[cat.id] ?? 0;
    return `
      <button class="category-tab${isActive}" data-category="${cat.id}">
        <span class="category-icon">${cat.icon}</span>
        <span class="category-name">${cat.name}</span>
        <span class="category-count">${formatCount(count)}</span>
      </button>
    `;
  }).join('');

  const allActive = activeCategory === 'all' ? ' active' : '';
  const allCount = counts['all'] ?? 0;

  return `
    <div class="category-tabs">
      <button class="category-tab${allActive}" data-category="all">
        <span class="category-icon">📦</span>
        <span class="category-name">All</span>
        <span class="category-count">${formatCount(allCount)}</span>
      </button>
      ${tabs}
    </div>
  `;
}

export function renderSearchBar(query: string): string {
  return `
    <div class="asset-search-bar">
      <input
        type="text"
        class="asset-search-input"
        placeholder="Search assets..."
        value="${escapeHtml(query)}"
        aria-label="Search assets"
      />
      <button class="asset-search-clear" ${query ? '' : 'style="display:none"'}>×</button>
    </div>
  `;
}

export function renderPreviewPane(asset: Asset | null): string {
  if (!asset) {
    return `<div class="asset-preview-pane empty"><p>Select an asset to preview</p></div>`;
  }

  return `
    <div class="asset-preview-pane">
      <div class="asset-preview-thumbnail">${asset.thumbnail}</div>
      <h3 class="asset-preview-name">${escapeHtml(asset.name)}</h3>
      <div class="asset-preview-meta">
        <span class="asset-category-badge">${asset.category}</span>
        <div class="asset-tags">
          ${asset.tags.map((t) => `<span class="asset-tag">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
      <button class="asset-insert-primary" data-asset-id="${asset.id}">
        Insert into Project
      </button>
    </div>
  `;
}

export function renderAssetLibraryUI(browser: AssetLibraryBrowser): string {
  const state = browser.getState();
  const assets = browser.getFilteredAssets();
  const counts: Record<string, number> = {
    all: browser.getAssetCount(),
  };
  for (const cat of ASSET_CATEGORIES) {
    counts[cat.id] = browser.getCategoryCount(cat.id);
  }

  return `
    <div class="asset-library">
      <div class="asset-library-header">
        ${renderSearchBar(state.searchQuery)}
        <div class="asset-view-toggle">
          <button class="${state.viewMode === 'grid' ? 'active' : ''}" data-view="grid">⊞</button>
          <button class="${state.viewMode === 'list' ? 'active' : ''}" data-view="list">☰</button>
        </div>
      </div>
      ${renderCategoryTabs(state.activeCategory, counts)}
      <div class="asset-library-body">
        <div class="asset-grid-container">
          ${assets.length > 0 ? renderAssetGrid(assets) : '<div class="asset-empty">No assets found</div>'}
        </div>
        ${renderPreviewPane(state.selectedAsset)}
      </div>
    </div>
  `;
}

// === CSS Styles ===

export const ASSET_LIBRARY_CSS = `
.asset-library {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: system-ui, -apple-system, sans-serif;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.asset-library-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.asset-search-bar {
  flex: 1;
  position: relative;
}

.asset-search-input {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}

.asset-search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.asset-search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #94a3b8;
}

.category-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  overflow-x: auto;
  border-bottom: 1px solid #e2e8f0;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
  transition: all 0.15s;
}

.category-tab:hover {
  background: #f1f5f9;
}

.category-tab.active {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}

.category-count {
  font-size: 10px;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 1px 6px;
  border-radius: 10px;
}

.category-tab.active .category-count {
  background: #dbeafe;
  color: #1d4ed8;
}

.asset-library-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.asset-grid-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.asset-grid {
  display: grid;
  gap: 8px;
}

.asset-grid-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.asset-grid-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.asset-thumbnail {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 4px;
  background: #f8fafc;
}

.asset-thumbnail svg {
  width: 100%;
  height: 100%;
}

.asset-label {
  margin-top: 6px;
  font-size: 11px;
  color: #475569;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asset-insert-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: #3b82f6;
  color: white;
  font-size: 16px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.asset-grid-item:hover .asset-insert-btn {
  opacity: 1;
}

.asset-insert-btn:hover {
  background: #2563eb;
  transform: scale(1.1);
}

.asset-preview-pane {
  width: 240px;
  border-left: 1px solid #e2e8f0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.asset-preview-pane.empty {
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.asset-preview-thumbnail {
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.asset-preview-thumbnail svg {
  width: 100%;
  height: 100%;
}

.asset-preview-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.asset-preview-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.asset-category-badge {
  display: inline-block;
  padding: 2px 8px;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 4px;
  font-size: 11px;
  text-transform: capitalize;
  width: fit-content;
}

.asset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.asset-tag {
  padding: 1px 6px;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 3px;
  font-size: 10px;
}

.asset-insert-primary {
  margin-top: auto;
  padding: 10px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.asset-insert-primary:hover {
  background: #2563eb;
}

.asset-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #94a3b8;
  font-size: 14px;
}

.asset-view-toggle {
  display: flex;
  gap: 2px;
}

.asset-view-toggle button {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.asset-view-toggle button:first-child {
  border-radius: 4px 0 0 4px;
}

.asset-view-toggle button:last-child {
  border-radius: 0 4px 4px 0;
}

.asset-view-toggle button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}
`;

// === Utility Functions ===

function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.substring(0, maxLen - 1) + '…' : str;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

// === Re-exports ===

export { AssetLibraryBrowser } from './AssetLibraryBrowser.js';
export { ASSET_CATEGORIES } from './AssetCategories.js';
export type { Asset, AssetCategory, AssetInsertEvent } from './types.js';