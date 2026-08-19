import React from 'react';
interface SortableSectionProps {
    id: string;
    isSelected: boolean;
    onSelect: () => void;
    onRemove: () => void;
    children: React.ReactNode;
}
export declare function SortableSection({ id, isSelected, onSelect, onRemove, children }: SortableSectionProps): React.JSX.Element;
export default SortableSection;
//# sourceMappingURL=SortableSection.d.ts.map