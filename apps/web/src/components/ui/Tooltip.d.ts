import React from 'react';
interface TooltipProps {
    content: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    children: React.ReactNode;
    show?: boolean;
    onDismiss?: () => void;
}
export declare function Tooltip({ content, position, delay, children, show, onDismiss }: TooltipProps): React.JSX.Element;
export default Tooltip;
//# sourceMappingURL=Tooltip.d.ts.map