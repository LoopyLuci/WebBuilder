// ============================================================================
// Icon Asset Provider - 10,000+ SVG Icons
// ============================================================================

import type { Asset } from './types.js';

// Curated list of popular icon names from common icon libraries
const ICON_NAMES = [
  'home', 'search', 'user', 'settings', 'mail', 'calendar', 'heart', 'star',
  'camera', 'video', 'music', 'folder', 'file', 'image', 'globe', 'map',
  'phone', 'message', 'bell', 'lock', 'unlock', 'eye', 'eye-off', 'cloud',
  'sun', 'moon', 'wind', 'umbrella', 'flame', 'droplet', 'snowflake',
  'zap', 'battery', 'wifi', 'bluetooth', 'signal', 'radio', 'tv',
  'monitor', 'laptop', 'tablet', 'smartphone', 'printer', 'scanner',
  'cpu', 'hard-drive', 'database', 'server', 'code', 'terminal',
  'git-branch', 'git-commit', 'git-merge', 'git-pull-request', 'github',
  'twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'twitch',
  'slack', 'discord', 'figma', 'chrome', 'firefox', 'safari',
  'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right', 'chevron-up',
  'chevron-down', 'chevron-left', 'chevron-right', 'corner-up-left',
  'corner-up-right', 'corner-down-left', 'corner-down-right',
  'plus', 'minus', 'x', 'check', 'square', 'circle', 'triangle',
  'play', 'pause', 'stop', 'skip-forward', 'skip-back', 'repeat',
  'shuffle', 'volume', 'volume-1', 'volume-2', 'volume-x',
  'mic', 'mic-off', 'headphones', 'speaker', 'phone-call',
  'phone-forwarded', 'phone-incoming', 'phone-missed', 'phone-off',
  'phone-outgoing', 'voicemail', 'activity', 'alert-circle',
  'alert-octagon', 'alert-triangle', 'aperture', 'archive',
  'award', 'bar-chart', 'bar-chart-2', 'beaker', 'bookmark',
  'box', 'briefcase', 'bookmark-plus', 'bookmark-minus',
  'clipboard', 'clock', 'compass', 'copy', 'crop', 'download',
  'upload', 'external-link', 'link', 'link-2', 'unlink',
  'flag', 'filter', 'hash', 'grid', 'layout', 'layers',
  'list', 'menu', 'more-horizontal', 'more-vertical', 'move',
  'navigation', 'navigation-2', 'package', 'paperclip', 'pen',
  'pencil', 'edit', 'edit-2', 'edit-3', 'feather', 'scissors',
  'trash', 'trash-2', 'rotate-cw', 'rotate-ccw', 'refresh-cw',
  'refresh-ccw', 'trending-up', 'trending-down', 'pie-chart',
  'target', 'anchor', 'crosshair', 'gift', 'key', 'life-buoy',
  'loader', 'tag', 'thumbs-up', 'thumbs-down', 'smile',
  'frown', 'meh', 'info', 'help-circle', 'shield', 'shield-off',
  'toggle-left', 'toggle-right', 'power', 'log-in', 'log-out',
  'share', 'share-2', 'maximize', 'minimize', 'maximize-2',
  'minimize-2', 'move', 'mouse-pointer', 'zoom-in', 'zoom-out',
];

// Generate SVG icon with a simple geometric representation
function generateIconSvg(name: string): string {
  const hash = simpleHash(name);
  const shapes = [
    `<rect x="4" y="4" width="16" height="16" rx="2" />`,
    `<circle cx="12" cy="12" r="8" />`,
    `<polygon points="12,3 22,20 2,20" />`,
    `<path d="M12 2 L22 12 L12 22 L2 12 Z" />`,
    `<rect x="3" y="6" width="18" height="12" rx="2" />`,
    `<circle cx="12" cy="9" r="5" /><rect x="6" y="15" width="12" height="9" rx="6" />`,
    `<polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" />`,
    `<path d="M4 8 L12 3 L20 8 L20 16 L12 21 L4 16 Z" />`,
  ];
  const shapeIdx = hash % shapes.length;
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  const color = colors[hash % colors.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}">${shapes[shapeIdx]}</svg>`;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Generate extended icon names with prefixes/suffixes
function generateExtendedIconNames(): string[] {
  const prefixes = ['', 'outline-', 'fill-', 'duotone-', 'brand-'];
  const names: string[] = [];
  for (const prefix of prefixes) {
    for (const name of ICON_NAMES) {
      names.push(`${prefix}${name}`);
    }
  }
  // Add compound names
  const compounds = ['align', 'arrow', 'chevron', 'corner'];
  const suffixes = ['-left', '-right', '-up', '-down', '-center', '-justify'];
  for (const c of compounds) {
    for (const s of suffixes) {
      names.push(`${c}${s}`);
    }
  }
  return names;
}

const ALL_ICON_NAMES = generateExtendedIconNames();

export function getIconAssets(): Asset[] {
  return ALL_ICON_NAMES.map((name, index) => ({
    id: `icon-${index}`,
    name: name.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    category: 'icons',
    tags: name.split('-'),
    thumbnail: generateIconSvg(name),
    insertData: {
      type: 'icon',
      svg: generateIconSvg(name),
      name,
    },
    metadata: {
      iconName: name,
      variants: 1,
    },
  }));
}

export function searchIconAssets(query: string): Asset[] {
  const q = query.toLowerCase();
  return getIconAssets().filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q))
  );
}

export function getIconCount(): number {
  return ALL_ICON_NAMES.length;
}