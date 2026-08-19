type ShortcutHandler = () => void;
interface ShortcutMap {
    [key: string]: ShortcutHandler;
}
export declare function useKeyboardShortcuts(shortcuts: ShortcutMap): void;
export default useKeyboardShortcuts;
//# sourceMappingURL=useKeyboardShortcuts.d.ts.map