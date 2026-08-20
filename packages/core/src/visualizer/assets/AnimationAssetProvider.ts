// ============================================================================
// Animation Asset Provider - CSS Animations & Keyframes
// ============================================================================

import type { Asset } from './types.js';

const ANIMATION_PRESETS = [
  { name: 'Fade In', css: 'opacity: 0; animation: fadeIn 0.5s ease forwards;', keyframes: '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }' },
  { name: 'Slide Up', css: 'transform: translateY(20px); opacity: 0; animation: slideUp 0.5s ease forwards;', keyframes: '@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }' },
  { name: 'Slide Down', css: 'transform: translateY(-20px); opacity: 0; animation: slideDown 0.5s ease forwards;', keyframes: '@keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }' },
  { name: 'Slide Left', css: 'transform: translateX(20px); opacity: 0; animation: slideLeft 0.5s ease forwards;', keyframes: '@keyframes slideLeft { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }' },
  { name: 'Slide Right', css: 'transform: translateX(-20px); opacity: 0; animation: slideRight 0.5s ease forwards;', keyframes: '@keyframes slideRight { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }' },
  { name: 'Scale In', css: 'transform: scale(0); animation: scaleIn 0.3s ease forwards;', keyframes: '@keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }' },
  { name: 'Scale Out', css: 'transform: scale(1.5); opacity: 0; animation: scaleOut 0.5s ease forwards;', keyframes: '@keyframes scaleOut { from { transform: scale(1.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }' },
  { name: 'Rotate In', css: 'transform: rotate(-180deg) scale(0); animation: rotateIn 0.5s ease forwards;', keyframes: '@keyframes rotateIn { from { transform: rotate(-180deg) scale(0); } to { transform: rotate(0) scale(1); } }' },
  { name: 'Bounce', css: 'animation: bounce 1s infinite;', keyframes: '@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }' },
  { name: 'Pulse', css: 'animation: pulse 2s infinite;', keyframes: '@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }' },
  { name: 'Shake', css: 'animation: shake 0.5s infinite;', keyframes: '@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }' },
  { name: 'Spin', css: 'animation: spin 2s linear infinite;', keyframes: '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }' },
  { name: 'Wobble', css: 'animation: wobble 1s infinite;', keyframes: '@keyframes wobble { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(5deg); } 75% { transform: rotate(-5deg); } }' },
  { name: 'Float', css: 'animation: float 3s ease-in-out infinite;', keyframes: '@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }' },
  { name: 'Glow', css: 'animation: glow 2s ease-in-out infinite;', keyframes: '@keyframes glow { 0%, 100% { box-shadow: 0 0 5px currentColor; } 50% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; } }' },
  { name: 'Ripple', css: 'position: relative;', keyframes: '@keyframes ripple { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }' },
];

export function getAnimationAssets(): Asset[] {
  return ANIMATION_PRESETS.map((anim, index) => ({
    id: `anim-${index}`,
    name: anim.name,
    category: 'animations',
    tags: anim.name.toLowerCase().split(' '),
    thumbnail: generateAnimationThumbnail(anim.name),
    insertData: {
      type: 'animation',
      css: anim.css,
      keyframes: anim.keyframes,
    },
    metadata: {
      duration: 'varies',
      infinite: anim.css.includes('infinite'),
    },
  }));
}

function generateAnimationThumbnail(name: string): string {
  const hash = simpleHash(name);
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  const color = colors[hash % colors.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f8fafc"/><rect x="30" y="30" width="40" height="40" fill="${color}" rx="4"><animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/></rect></svg>`;
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

export function searchAnimationAssets(query: string): Asset[] {
  const q = query.toLowerCase();
  return getAnimationAssets().filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q))
  );
}

export function getAnimationCount(): number {
  return ANIMATION_PRESETS.length;
}