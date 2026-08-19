'use client';
import { useEffect, useCallback, useRef } from 'react';
function getPlatformKey(e) {
    const parts = [];
    if (e.ctrlKey || e.metaKey)
        parts.push('mod');
    if (e.shiftKey)
        parts.push('shift');
    if (e.altKey)
        parts.push('alt');
    parts.push(e.key.toLowerCase());
    return parts.join('+');
}
export function useKeyboardShortcuts(shortcuts) {
    const shortcutsRef = useRef(shortcuts);
    shortcutsRef.current = shortcuts;
    const handleKeyDown = useCallback((e) => {
        // Don't trigger shortcuts when typing in inputs
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
        }
        const shortcutKey = getPlatformKey(e);
        const handler = shortcutsRef.current[shortcutKey];
        if (handler) {
            e.preventDefault();
            handler();
        }
    }, []);
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}
export default useKeyboardShortcuts;
//# sourceMappingURL=useKeyboardShortcuts.js.map